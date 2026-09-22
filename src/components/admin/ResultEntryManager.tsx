import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Save, 
  Send, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter, 
  AlertCircle,
  Mic,
  PenTool,
  LayoutGrid,
  Sparkles,
  Trophy,
  User,
  Plus,
  Hash,
  Check,
  Zap,
  Medal,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { 
  useFest, 
  formatParticipantDisplayName, 
  isGroupOrGeneralProgramme,
  calculateTotalResultPoints 
} from '../../context/FestContext';
import { Programme, Participant, Result, TeamId } from '../../types';
import { ResultPosterModal } from '../common/ResultPosterModal';

interface PositionEntry {
  id: string;
  position: 1 | 2 | 3 | null;
  chestNumber: string;
  grade: string;
  marks: number;
}

export const ResultEntryManager: React.FC = () => {
  const { 
    programmes, 
    participants, 
    students, 
    teams,
    categories: definedCategories,
    results, 
    assignParticipant,
    saveResultDraft,
    submitJudgeResult,
    publishResult, 
    unpublishResult, 
    deleteResult, 
    currentUser,
    festSettings,
    generateResultPoster
  } = useFest();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'stage' | 'non_stage'>('all');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quickAddSearch, setQuickAddSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // In-App Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'all' | 'participant';
    participantId?: string;
    chestNumber?: string;
    studentName?: string;
  }>({ isOpen: false, type: 'all' });

  // Dynamic Position & Grade Entries (can add 1st, 2nd, 3rd, or grade-only awards)
  const [positionEntries, setPositionEntries] = useState<PositionEntry[]>([
    { id: 'pos-1', position: 1, chestNumber: '', grade: 'A+', marks: 95 },
    { id: 'pos-2', position: 2, chestNumber: '', grade: 'A', marks: 85 },
    { id: 'pos-3', position: 3, chestNumber: '', grade: 'B+', marks: 75 },
  ]);

  // Local state for all participants in the table:
  // participantId -> { totalMarks: number, grade: string, position: 1 | 2 | 3 | null, remarks: string }
  const [localRows, setLocalRows] = useState<Record<string, {
    totalMarks: number;
    grade: string;
    position: 1 | 2 | 3 | null;
    remarks: string;
  }>>({});

  // Helper to determine if a programme is Stage or Non-Stage
  const isStageProgramme = (p: Programme) => {
    const typeStr = (p.type || '').toLowerCase();
    const venueStr = (p.venue || '').toLowerCase();
    const subCatStr = (p.sub_category || '').toLowerCase();
    
    if (typeStr === 'stage') return true;
    if (typeStr === 'non_stage' || typeStr === 'off_stage') return false;

    if (venueStr.includes('stage') || venueStr.includes('auditorium') || venueStr.includes('hall')) return true;
    if (venueStr.includes('room') || venueStr.includes('gallery') || venueStr.includes('lab') || venueStr.includes('class') || venueStr.includes('exam')) return false;

    if (subCatStr.includes('writing') || subCatStr.includes('art') || subCatStr.includes('calligraphy') || subCatStr.includes('essay')) return false;

    return true;
  };

  // Derive unique categories
  const rawCategories = Array.from(new Set([
    ...programmes.map(p => p.category),
    ...(definedCategories || []).map(c => c.code || c.name)
  ])).filter(Boolean);

  // Filter programmes based on category and stage/non-stage
  const filteredProgrammes = programmes.filter(p => {
    // Category match
    const pCat = (p.category || '').toUpperCase().replace(/\s+/g, '_');
    const sCat = selectedCategory.toUpperCase().replace(/\s+/g, '_');
    const matchesCat = selectedCategory === 'all' || pCat === sCat || p.category === selectedCategory;

    // Stage / Non-Stage match
    const isStage = isStageProgramme(p);
    let matchesType = true;
    if (selectedEventType === 'stage') matchesType = isStage;
    if (selectedEventType === 'non_stage') matchesType = !isStage;

    // Search match
    const matchesSearch = !searchTerm || 
      p.programme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programme_code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCat && matchesType && matchesSearch;
  });

  // Current selected programme
  const activeProgramme = programmes.find(p => p.id === selectedProgrammeId) || filteredProgrammes[0];

  useEffect(() => {
    if (!selectedProgrammeId && filteredProgrammes.length > 0) {
      setSelectedProgrammeId(filteredProgrammes[0].id);
    }
  }, [filteredProgrammes, selectedProgrammeId]);

  // Active programme participants (including any student who already has a result record in this programme)
  const activeParticipants = useMemo(() => {
    if (!activeProgramme) return [];
    
    const list: Participant[] = [...participants.filter(p => p.programme_id === activeProgramme.id)];
    const existingIds = new Set(list.map(p => p.id));
    const existingStudentIds = new Set(list.map(p => p.student_id));
    const existingChests = new Set(list.map(p => p.chest_number.trim().toLowerCase()));

    // Also bring in any student from results table if missing from participants
    const prgResults = results.filter(r => r.programme_id === activeProgramme.id);
    prgResults.forEach(r => {
      const chestKey = (r.chest_number || '').trim().toLowerCase();
      if (!existingIds.has(r.participant_id) && (!r.student_id || !existingStudentIds.has(r.student_id)) && (!chestKey || !existingChests.has(chestKey))) {
        const student = students.find(s => s.id === r.student_id || s.chest_number.trim().toLowerCase() === chestKey);
        const synthPart: Participant = {
          id: r.participant_id || ('synth-' + (r.student_id || r.chest_number)),
          participant_id: r.participant_id || ('P-' + (r.student_id || r.chest_number)),
          programme_id: activeProgramme.id,
          student_id: r.student_id || student?.id || '',
          chest_number: r.chest_number || student?.chest_number || '',
          team: r.team || student?.team || 'nayro',
          status: 'registered'
        };
        list.push(synthPart);
        existingIds.add(synthPart.id);
        if (synthPart.student_id) existingStudentIds.add(synthPart.student_id);
        if (chestKey) existingChests.add(chestKey);
      }
    });

    return list;
  }, [activeProgramme, participants, results, students]);

  // Active programme results from database
  const activeProgrammeResults = useMemo(() => {
    return activeProgramme ? results.filter(r => r.programme_id === activeProgramme.id) : [];
  }, [activeProgramme, results]);

  const maxTotalMarks = activeProgramme?.maximum_marks || 100;

  // Grade calculator helper
  const computeGrade = (total: number, max: number = 100): string => {
    const pct = (total / (max || 100)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 40) return 'C';
    return 'D';
  };

  // Sync database results into local state and dynamic position entries when programme changes
  useEffect(() => {
    if (!activeProgramme) return;

    const initialRows: Record<string, {
      totalMarks: number;
      grade: string;
      position: 1 | 2 | 3 | null;
      remarks: string;
    }> = {};

    const existingWinners: PositionEntry[] = [];

    activeParticipants.forEach(p => {
      const existing = activeProgrammeResults.find(r => 
        r.participant_id === p.id || 
        (r.student_id && p.student_id && r.student_id === p.student_id) || 
        (r.chest_number && p.chest_number && r.chest_number.trim().toLowerCase() === p.chest_number.trim().toLowerCase())
      );

      if (existing) {
        initialRows[p.id] = {
          totalMarks: existing.total_marks || 0,
          grade: existing.grade || 'A',
          position: existing.position || null,
          remarks: existing.remarks || '',
        };

        if (existing.position === 1 || existing.position === 2 || existing.position === 3) {
          existingWinners.push({
            id: 'pos-' + existing.position + '-' + p.id,
            position: existing.position,
            chestNumber: p.chest_number,
            grade: existing.grade || (existing.position === 1 ? 'A+' : existing.position === 2 ? 'A' : 'B+'),
            marks: existing.total_marks || (existing.position === 1 ? 95 : existing.position === 2 ? 85 : 75),
          });
        }
      } else {
        initialRows[p.id] = {
          totalMarks: 0,
          grade: 'No Grade',
          position: null,
          remarks: '',
        };
      }
    });

    setLocalRows(initialRows);

    if (existingWinners.length > 0) {
      existingWinners.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
      setPositionEntries(existingWinners);
    } else {
      setPositionEntries([
        { id: 'pos-1', position: 1, chestNumber: '', grade: 'A+', marks: 95 },
        { id: 'pos-2', position: 2, chestNumber: '', grade: 'A', marks: 85 },
        { id: 'pos-3', position: 3, chestNumber: '', grade: 'B+', marks: 75 },
      ]);
    }
  }, [activeProgramme?.id, activeParticipants, activeProgrammeResults]);

  // Robust Student & Participant Lookup by Chest Number
  const getParticipantByChest = (chestNum: string): { participant?: Participant; student?: any; team?: any } => {
    if (!chestNum.trim()) return {};
    const clean = chestNum.trim().toLowerCase();
    
    // 1. Search in active programme participants
    let part = activeParticipants.find(p => p.chest_number.trim().toLowerCase() === clean);
    
    // 2. Search in all participants
    if (!part) {
      part = participants.find(p => p.chest_number.trim().toLowerCase() === clean);
    }

    // 3. Search in all registered students (by chest_number or student_id)
    let student = students.find(s => 
      s.chest_number.trim().toLowerCase() === clean || 
      (s.student_id && s.student_id.trim().toLowerCase() === clean) ||
      (s.admission_number && s.admission_number.trim().toLowerCase() === clean)
    );

    if (!student && part) {
      student = students.find(s => s.id === part?.student_id);
    }

    if (!student && !part) return {};

    // Synthesize participant object if student exists but not registered yet
    if (!part && student) {
      part = {
        id: 'auto-part-' + student.id + '-' + (activeProgramme?.id || ''),
        participant_id: 'P-' + student.chest_number + '-' + (activeProgramme?.id || ''),
        programme_id: activeProgramme?.id || '',
        student_id: student.id,
        chest_number: student.chest_number,
        team: student.team,
        status: 'registered'
      };
    }

    const team = teams.find(t => t.id === (student?.team || part?.team));

    return { participant: part, student, team };
  };

  // Quick Add Participant to Current Programme
  const handleQuickAddParticipant = (studentId: string) => {
    if (!activeProgramme || !studentId) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Check if already in active participants
    if (activeParticipants.some(p => p.student_id === student.id || p.chest_number.toLowerCase() === student.chest_number.toLowerCase())) {
      showToast(`Student #${student.chest_number} (${student.student_name}) is already in the roster!`, 'info');
      return;
    }

    assignParticipant({
      participant_id: 'P-' + student.chest_number + '-' + activeProgramme.id,
      programme_id: activeProgramme.id,
      student_id: student.id,
      chest_number: student.chest_number,
      team: student.team,
      status: 'registered'
    });

    setQuickAddSearch('');
    showToast(`Added #${student.chest_number} ${student.student_name} to "${activeProgramme.programme_name}"!`, 'success');
  };

  // Dynamic Position & Grade Entry Controls:
  const handleAddPositionEntry = (preferredPos?: 1 | 2 | 3) => {
    const nextPos: 1 | 2 | 3 = preferredPos || (
      positionEntries.filter(p => p.position !== null).length === 0 ? 1 :
      positionEntries.filter(p => p.position !== null).length === 1 ? 2 :
      3
    );

    const newEntry: PositionEntry = {
      id: 'pos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      position: nextPos,
      chestNumber: '',
      grade: nextPos === 1 ? 'A+' : nextPos === 2 ? 'A' : 'B+',
      marks: nextPos === 1 ? 95 : nextPos === 2 ? 85 : 75,
    };

    setPositionEntries(prev => [...prev, newEntry]);
    showToast(`Added ${nextPos === 1 ? '1st' : nextPos === 2 ? '2nd' : '3rd'} Place card! Type chest # to assign student.`, 'info');
  };

  const handleAddGradeEntry = (preferredGrade: string = 'A') => {
    const defaultMarks = preferredGrade === 'A+' ? 95 : preferredGrade === 'A' ? 90 : preferredGrade === 'B+' ? 80 : preferredGrade === 'B' ? 70 : preferredGrade === 'C+' ? 60 : 50;

    const newEntry: PositionEntry = {
      id: 'grade-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      position: null,
      chestNumber: '',
      grade: preferredGrade,
      marks: defaultMarks,
    };

    setPositionEntries(prev => [...prev, newEntry]);
    showToast(`Added Grade ${preferredGrade} entry card! Type chest # to assign student.`, 'info');
  };

  const handleRemovePositionEntry = (id: string) => {
    setPositionEntries(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdatePositionEntry = (id: string, updates: Partial<PositionEntry>) => {
    setPositionEntries(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Apply all dynamic position and grade entries to the participant table
  const handleApplyPositionsToTable = () => {
    if (!activeProgramme) return;

    const newRows = { ...localRows };

    // Clear previous positions from all participants
    Object.keys(newRows).forEach(id => {
      if (newRows[id]) {
        newRows[id] = { ...newRows[id], position: null };
      }
    });

    let appliedCount = 0;

    positionEntries.forEach(entry => {
      if (!entry.chestNumber.trim()) return;
      const details = getParticipantByChest(entry.chestNumber);
      if (details.student || details.participant) {
        // If not yet in participants, auto register
        if (!participants.some(p => p.programme_id === activeProgramme.id && (p.chest_number.toLowerCase() === entry.chestNumber.toLowerCase() || (details.student && p.student_id === details.student.id)))) {
          if (details.student) {
            assignParticipant({
              participant_id: 'P-' + details.student.chest_number + '-' + activeProgramme.id,
              programme_id: activeProgramme.id,
              student_id: details.student.id,
              chest_number: details.student.chest_number,
              team: details.student.team,
              status: 'registered'
            });
          }
        }

        const id = details.participant?.id || ('synth-' + (details.student?.id || entry.chestNumber));
        newRows[id] = {
          ...(newRows[id] || { remarks: '' }),
          position: entry.position,
          grade: entry.grade,
          totalMarks: entry.marks,
          remarks: newRows[id]?.remarks || (entry.position ? `${entry.position === 1 ? '1st' : entry.position === 2 ? '2nd' : '3rd'} Place Winner` : `Grade ${entry.grade} Award Winner`),
        };
        appliedCount++;
      }
    });

    setLocalRows(newRows);
    showToast(`Applied ${appliedCount} positions & grades to the participant roster!`, 'success');
  };

  // Direct edits inside the table
  const handleTableRowPositionChange = (participantId: string, position: 1 | 2 | 3 | null) => {
    setLocalRows(prev => {
      const row = prev[participantId] || { totalMarks: 0, grade: 'A', position: null, remarks: '' };
      return {
        ...prev,
        [participantId]: {
          ...row,
          position,
          grade: position === 1 ? (row.grade === 'No Grade' ? 'A+' : row.grade) :
                 position === 2 ? (row.grade === 'No Grade' ? 'A' : row.grade) :
                 position === 3 ? (row.grade === 'No Grade' ? 'B+' : row.grade) : row.grade,
        }
      };
    });
  };

  const handleTableRowGradeChange = (participantId: string, grade: string) => {
    setLocalRows(prev => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] || { totalMarks: 0, grade: 'A', position: null, remarks: '' }),
        grade,
      }
    }));
  };

  const handleTableRowMarksChange = (participantId: string, marksStr: string) => {
    const val = marksStr === '' ? 0 : Math.min(Math.max(0, Number(marksStr) || 0), maxTotalMarks);
    setLocalRows(prev => {
      const row = prev[participantId] || { totalMarks: 0, grade: 'A', position: null, remarks: '' };
      return {
        ...prev,
        [participantId]: {
          ...row,
          totalMarks: val,
          grade: row.grade === 'No Grade' ? computeGrade(val, maxTotalMarks) : row.grade,
        }
      };
    });
  };

  const handleTableRowRemarksChange = (participantId: string, remarks: string) => {
    setLocalRows(prev => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] || { totalMarks: 0, grade: 'A', position: null, remarks: '' }),
        remarks,
      }
    }));
  };

  // Save all as draft (with synchronous state computation)
  const handleSaveAllDrafts = () => {
    if (!activeProgramme) return;

    // Build complete mapping combining positionEntries + localRows + activeParticipants
    const combinedRows: Record<string, { chestNumber: string; studentId: string; team: TeamId; totalMarks: number; grade: string; position: 1 | 2 | 3 | null; remarks: string }> = {};

    activeParticipants.forEach(p => {
      const row = localRows[p.id] || { totalMarks: 0, grade: 'No Grade', position: null, remarks: '' };
      combinedRows[p.id] = {
        chestNumber: p.chest_number,
        studentId: p.student_id,
        team: p.team as TeamId,
        totalMarks: row.totalMarks,
        grade: row.grade,
        position: row.position,
        remarks: row.remarks
      };
    });

    // Apply fast position entries
    positionEntries.forEach(entry => {
      if (!entry.chestNumber.trim()) return;
      const details = getParticipantByChest(entry.chestNumber);
      if (details.student || details.participant) {
        const student = details.student;
        const chest = entry.chestNumber.trim();
        const pId = details.participant?.id || ('synth-' + (student?.id || chest));

        combinedRows[pId] = {
          chestNumber: chest,
          studentId: student?.id || details.participant?.student_id || '',
          team: (student?.team || details.participant?.team || 'nayro') as TeamId,
          totalMarks: entry.marks,
          grade: entry.grade,
          position: entry.position,
          remarks: entry.position ? `${entry.position === 1 ? '1st' : entry.position === 2 ? '2nd' : '3rd'} Place Winner` : `Grade ${entry.grade} Award Winner`
        };

        // Ensure registered
        if (student && !participants.some(p => p.programme_id === activeProgramme.id && p.chest_number.toLowerCase() === chest.toLowerCase())) {
          assignParticipant({
            participant_id: 'P-' + student.chest_number + '-' + activeProgramme.id,
            programme_id: activeProgramme.id,
            student_id: student.id,
            chest_number: student.chest_number,
            team: student.team,
            status: 'registered'
          });
        }
      }
    });

    const entriesList = Object.entries(combinedRows);
    if (entriesList.length === 0) {
      showToast('Please enter chest numbers or add participants before saving draft.', 'error');
      return;
    }

    entriesList.forEach(([pId, data]) => {
      saveResultDraft({
        programme_id: activeProgramme.id,
        participant_id: pId,
        student_id: data.studentId,
        chest_number: data.chestNumber,
        team: data.team,
        judge_id: currentUser?.id || 'admin',
        total_marks: data.totalMarks || (data.position === 1 ? 95 : data.position === 2 ? 85 : data.position === 3 ? 75 : 50),
        grade: data.grade,
        position: data.position,
        remarks: data.remarks,
      });
    });

    showToast(`Draft saved for ${entriesList.length} participants in "${activeProgramme.programme_name}"!`, 'success');
  };

  // Submit and Publish Directly to Scoreboard
  const handleSaveAndPublishAll = () => {
    if (!activeProgramme) return;

    // Build complete mapping combining positionEntries + localRows + activeParticipants
    const combinedRows: Record<string, { chestNumber: string; studentId: string; team: TeamId; totalMarks: number; grade: string; position: 1 | 2 | 3 | null; remarks: string }> = {};

    activeParticipants.forEach(p => {
      const row = localRows[p.id] || { totalMarks: 0, grade: 'No Grade', position: null, remarks: '' };
      combinedRows[p.id] = {
        chestNumber: p.chest_number,
        studentId: p.student_id,
        team: p.team as TeamId,
        totalMarks: row.totalMarks,
        grade: row.grade,
        position: row.position,
        remarks: row.remarks
      };
    });

    // Apply fast position entries
    positionEntries.forEach(entry => {
      if (!entry.chestNumber.trim()) return;
      const details = getParticipantByChest(entry.chestNumber);
      if (details.student || details.participant) {
        const student = details.student;
        const chest = entry.chestNumber.trim();
        const pId = details.participant?.id || ('synth-' + (student?.id || chest));

        combinedRows[pId] = {
          chestNumber: chest,
          studentId: student?.id || details.participant?.student_id || '',
          team: (student?.team || details.participant?.team || 'nayro') as TeamId,
          totalMarks: entry.marks,
          grade: entry.grade,
          position: entry.position,
          remarks: entry.position ? `${entry.position === 1 ? '1st' : entry.position === 2 ? '2nd' : '3rd'} Place Winner` : `Grade ${entry.grade} Award Winner`
        };

        // Ensure registered in participant table
        if (student && !participants.some(p => p.programme_id === activeProgramme.id && p.chest_number.toLowerCase() === chest.toLowerCase())) {
          assignParticipant({
            participant_id: 'P-' + student.chest_number + '-' + activeProgramme.id,
            programme_id: activeProgramme.id,
            student_id: student.id,
            chest_number: student.chest_number,
            team: student.team,
            status: 'registered'
          });
        }
      }
    });

    const entriesList = Object.entries(combinedRows);
    if (entriesList.length === 0) {
      showToast('Please enter chest numbers or add participants before publishing.', 'error');
      return;
    }

    // Submit each result
    entriesList.forEach(([pId, data]) => {
      submitJudgeResult({
        programme_id: activeProgramme.id,
        participant_id: pId,
        student_id: data.studentId,
        chest_number: data.chestNumber,
        team: data.team,
        judge_id: currentUser?.id || 'admin',
        total_marks: data.totalMarks,
        grade: data.grade,
        position: data.position,
        remarks: data.remarks,
      });
    });

    // Direct publish & poster generation
    setTimeout(() => {
      const currentRes = results.filter(r => r.programme_id === activeProgramme.id);
      currentRes.forEach(r => {
        publishResult(r.id);
      });
      generateResultPoster(activeProgramme.id, { status: 'Published' });
      showToast(`Results & Positions published to Live Scoreboard for "${activeProgramme.programme_name}"!`, 'success');
    }, 250);
  };

  // Unpublish
  const handleUnpublishAll = () => {
    if (!activeProgramme) return;
    const currentRes = results.filter(r => r.programme_id === activeProgramme.id);
    currentRes.forEach(r => {
      unpublishResult(r.id);
    });
    showToast(`Results unpublished for "${activeProgramme.programme_name}".`, 'info');
  };

  // Reset / Clear results for this programme via Modal
  const handleOpenDeleteAllModal = () => {
    if (!activeProgramme) return;
    setDeleteModal({
      isOpen: true,
      type: 'all'
    });
  };

  // Clear single participant result via Modal
  const handleOpenDeleteParticipantModal = (participantId: string, chestNumber: string, studentName: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'participant',
      participantId,
      chestNumber,
      studentName
    });
  };

  // Perform actual confirmed delete
  const handleConfirmDelete = () => {
    if (!activeProgramme) return;

    if (deleteModal.type === 'all') {
      const currentRes = results.filter(r => r.programme_id === activeProgramme.id);
      currentRes.forEach(r => {
        deleteResult(r.id);
      });

      // Reset position entries
      setPositionEntries([
        { id: 'pos-1', position: 1, chestNumber: '', grade: 'A+', marks: 95 },
        { id: 'pos-2', position: 2, chestNumber: '', grade: 'A', marks: 85 },
        { id: 'pos-3', position: 3, chestNumber: '', grade: 'B+', marks: 75 },
      ]);
      
      const resetRows: Record<string, any> = {};
      activeParticipants.forEach(p => {
        resetRows[p.id] = { totalMarks: 0, grade: 'No Grade', position: null, remarks: '' };
      });
      setLocalRows(resetRows);

      showToast(`All results & marks successfully deleted for "${activeProgramme.programme_name}"!`, 'success');
    } else if (deleteModal.type === 'participant' && deleteModal.participantId) {
      const pId = deleteModal.participantId;
      const part = activeParticipants.find(p => p.id === pId);
      const sId = part?.student_id;
      const chest = part?.chest_number;

      // Find and delete any existing result records for this participant
      const currentRes = results.filter(r => 
        r.programme_id === activeProgramme.id && 
        (r.participant_id === pId || (sId && r.student_id === sId) || (chest && r.chest_number === chest))
      );
      currentRes.forEach(r => {
        deleteResult(r.id);
      });

      // Reset row in local table
      setLocalRows(prev => ({
        ...prev,
        [pId]: { totalMarks: 0, grade: 'No Grade', position: null, remarks: '' }
      }));

      // If this chest was in position entries, clear it
      if (chest) {
        setPositionEntries(prev => prev.map(entry => 
          entry.chestNumber === chest ? { ...entry, chestNumber: '' } : entry
        ));
      }

      showToast(`Result deleted for Chest #${deleteModal.chestNumber || ''} (${deleteModal.studentName || 'Participant'})!`, 'success');
    }

    setDeleteModal({ isOpen: false, type: 'all' });
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stage & Non-Stage counts
  const stageCount = programmes.filter(p => isStageProgramme(p)).length;
  const nonStageCount = programmes.filter(p => !isStageProgramme(p)).length;

  // Status for active programme
  const isAllPublished = activeProgrammeResults.length > 0 && activeProgrammeResults.every(r => r.status === 'published');
  const isSomeSubmitted = activeProgrammeResults.some(r => r.status === 'submitted' || r.status === 'verified');
  const isDraft = activeProgrammeResults.some(r => r.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xl transition border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' 
            : toastMessage.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
            : 'bg-amber-950/90 text-amber-200 border-amber-500/40'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="animate-spin text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold uppercase opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white flex items-center gap-2">
            <Trophy size={24} className="text-amber-400" />
            <span>Result Entry & Position Allocation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter Chest Numbers to automatically fetch student details, assign positions (1st, 2nd, 3rd), add custom/shared positions, and award Grades.
          </p>
        </div>

        {/* Global Quick Status Badge */}
        {activeProgramme && (
          <div className="flex items-center gap-2">
            {isAllPublished ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 size={14} />
                <span>PUBLISHED TO SCOREBOARD</span>
              </span>
            ) : isSomeSubmitted ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5">
                <Clock size={14} />
                <span>SUBMITTED / VERIFIED</span>
              </span>
            ) : isDraft ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>DRAFT SAVED</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>PENDING ENTRY</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Toolbar (Stage/Non-Stage + Category + Search + Programme Selector) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        
        {/* Stage / Non-Stage Filter Buttons */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Filter size={13} className="text-amber-400" />
            <span>Event Type Filter (Stage / Non-Stage)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedEventType('all')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedEventType === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>All Events ({programmes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedEventType('stage')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedEventType === 'stage'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Mic size={14} className={selectedEventType === 'stage' ? 'text-slate-950' : 'text-amber-400'} />
              <span>Stage Events ({stageCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedEventType('non_stage')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedEventType === 'non_stage'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <PenTool size={14} className={selectedEventType === 'non_stage' ? 'text-slate-950' : 'text-emerald-400'} />
              <span>Non-Stage Events ({nonStageCount})</span>
            </button>
          </div>
        </div>

        {/* Category & Programme Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Filter size={12} className="text-amber-400" />
              <span>Filter by Category</span>
            </label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedProgrammeId('');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Categories ({programmes.length} total)</option>
              {rawCategories.map(cat => {
                const count = programmes.filter(p => {
                  const pCat = p.category.toUpperCase().replace(/\s+/g, '_');
                  const sCat = cat.toUpperCase().replace(/\s+/g, '_');
                  const matchesCat = pCat === sCat || p.category === cat;
                  
                  if (selectedEventType === 'stage') return matchesCat && isStageProgramme(p);
                  if (selectedEventType === 'non_stage') return matchesCat && !isStageProgramme(p);
                  return matchesCat;
                }).length;

                return (
                  <option key={cat} value={cat}>
                    {cat} ({count} programmes)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Programme */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Search size={12} className="text-amber-400" />
              <span>Search Programme</span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search code or event name..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Programme Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Award size={12} className="text-amber-400" />
              <span>Select Programme ({filteredProgrammes.length} matching)</span>
            </label>
            <select
              value={activeProgramme?.id || ''}
              onChange={e => setSelectedProgrammeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              {filteredProgrammes.map(p => {
                const prgRes = results.filter(r => r.programme_id === p.id);
                const isPub = prgRes.length > 0 && prgRes.every(r => r.status === 'published');
                const isSub = prgRes.some(r => r.status === 'submitted' || r.status === 'verified');
                const tag = isPub ? '✓ PUBLISHED' : isSub ? '⏳ SUBMITTED' : prgRes.length > 0 ? '📝 DRAFT' : '⭕ PENDING';

                return (
                  <option key={p.id} value={p.id}>
                    [{tag}] {p.programme_name} ({p.programme_code}) — {p.category}
                  </option>
                );
              })}
            </select>
          </div>

        </div>

      </div>

      {/* Main Workspace */}
      {!activeProgramme ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400">
          No programmes found matching the selected category and filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Programme Banner */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                  {activeProgramme.programme_code}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                  {activeProgramme.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold">
                  {isStageProgramme(activeProgramme) ? 'STAGE EVENT' : 'NON-STAGE EVENT'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                {activeProgramme.programme_name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeParticipants.length} Registered Participants • Add position winners dynamically below with auto student details.
              </p>
              
              {/* Point Scheme Formula Pill */}
              {(() => {
                const info = calculateTotalResultPoints(activeProgramme, 1, 'A', festSettings.pointScheme);
                return (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 flex-wrap">
                    <Sparkles size={14} className="text-amber-400 shrink-0" />
                    <span>Scoring Scheme: <strong className="text-white">{info.criteriaLabel}</strong> • <span className="text-amber-200">Grades: A=5, B=3, C=1</span></span>
                  </div>
                );
              })()}
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveAllDrafts}
                disabled={activeParticipants.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndPublishAll}
                disabled={activeParticipants.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Trophy size={14} />
                <span>Publish to Scoreboard</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPosterModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                title="Generate & Download WhatsApp Status Result Poster"
              >
                <Smartphone size={14} />
                <span>Status Poster</span>
              </button>

              {isAllPublished && (
                <button
                  type="button"
                  onClick={handleUnpublishAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs transition cursor-pointer"
                >
                  <EyeOff size={14} />
                  <span>Unpublish</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenDeleteAllModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/50 hover:border-rose-400 font-bold text-xs transition cursor-pointer shadow-sm"
                title="Delete all scores and positions for this programme (ഫലം റദ്ദാക്കുക)"
              >
                <Trash2 size={14} className="text-rose-400" />
                <span>Delete Results</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC POSITION WINNERS CARD BUILDER */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                  <Zap size={20} className="text-amber-400 fill-amber-400" />
                  <span>Position Winners (ഓരോ പൊസിഷനും Add ചെയ്യാം)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add 1st, 2nd, 3rd, or shared positions. Type Chest Number to automatically fetch student name and team!
                </p>
              </div>

              {/* Add Position & Grade Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddPositionEntry(1)}
                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ 1st Place 🥇</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPositionEntry(2)}
                  className="px-3 py-2 rounded-xl bg-slate-300/15 hover:bg-slate-300/25 text-slate-200 border border-slate-300/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ 2nd Place 🥈</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPositionEntry(3)}
                  className="px-3 py-2 rounded-xl bg-amber-800/20 hover:bg-amber-800/30 text-amber-400 border border-amber-700/50 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ 3rd Place 🥉</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddGradeEntry('A')}
                  className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ Grade A 🏅</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddGradeEntry('B')}
                  className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ Grade B 🎖️</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddGradeEntry('C')}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>+ Grade C 🎖️</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyPositionsToTable}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-500/20"
                >
                  <Check size={15} />
                  <span>Apply All</span>
                </button>
              </div>
            </div>

            {/* Position & Grade Entry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {positionEntries.map((entry, index) => {
                const details = getParticipantByChest(entry.chestNumber);
                const isPos1 = entry.position === 1;
                const isPos2 = entry.position === 2;
                const isPos3 = entry.position === 3;
                const isGradeOnly = entry.position === null;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-2xl border-2 space-y-3 relative overflow-hidden shadow-lg transition ${
                      isPos1 
                        ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-amber-400/60' 
                        : isPos2
                        ? 'bg-gradient-to-b from-slate-300/15 via-slate-900 to-slate-900 border-slate-400/50'
                        : isPos3
                        ? 'bg-gradient-to-b from-amber-800/20 via-slate-900 to-slate-900 border-amber-700/50'
                        : 'bg-gradient-to-b from-purple-500/15 via-slate-900 to-slate-900 border-purple-500/50'
                    }`}
                  >
                    {/* Top Header with Position / Grade Selector & Remove Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={entry.position === null ? '' : entry.position}
                          onChange={e => {
                            const val = e.target.value === '' ? null : Number(e.target.value) as 1 | 2 | 3;
                            handleUpdatePositionEntry(entry.id, { 
                              position: val,
                              grade: val === 1 ? 'A+' : val === 2 ? 'A' : val === 3 ? 'B+' : entry.grade,
                              marks: val === 1 ? 95 : val === 2 ? 85 : val === 3 ? 75 : entry.marks
                            });
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-black uppercase cursor-pointer border focus:outline-none ${
                            isPos1 ? 'bg-amber-500 text-slate-950 border-amber-400' :
                            isPos2 ? 'bg-slate-300 text-slate-950 border-slate-400' :
                            isPos3 ? 'bg-amber-800 text-amber-100 border-amber-700' :
                            'bg-purple-600 text-white border-purple-400'
                          }`}
                        >
                          <option value="1">🥇 1st Place</option>
                          <option value="2">🥈 2nd Place</option>
                          <option value="3">🥉 3rd Place</option>
                          <option value="">🎖️ Grade Award (No Pos)</option>
                        </select>
                        <span className="text-[11px] font-bold text-slate-400">
                          {isGradeOnly ? `Grade ${entry.grade}` : `Pos #${entry.position}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePositionEntry(entry.id)}
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                        title="Remove entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Chest Number Input */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Chest Number (Enter or Select)
                      </label>
                      <div className="relative">
                        <Hash size={14} className="absolute left-3 top-3 text-amber-400" />
                        <input
                          type="text"
                          value={entry.chestNumber}
                          onChange={e => handleUpdatePositionEntry(entry.id, { chestNumber: e.target.value })}
                          placeholder="Type Chest # (e.g. 101)"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-amber-400/40 text-white font-mono font-black text-sm placeholder-slate-600 focus:outline-none focus:border-amber-300"
                        />
                      </div>
                    </div>

                    {/* Auto-Fetched Student Details Preview */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 min-h-[58px] flex items-center">
                      {details.student ? (
                        <div className="flex items-center gap-2.5 w-full">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isPos1 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                            isPos2 ? 'bg-slate-300/20 border-slate-300/40 text-slate-200' :
                            isPos3 ? 'bg-amber-800/20 border-amber-700/40 text-amber-400' :
                            'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          }`}>
                            {details.student.student_name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{formatParticipantDisplayName(details.student.student_name, activeProgramme)}</span>
                              {isGroupOrGeneralProgramme(activeProgramme) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 font-mono">
                                  TEAM REP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                details.team?.id === 'nayro' ? 'text-amber-400' :
                                details.team?.id === 'zayro' ? 'text-cyan-400' : 'text-emerald-400'
                              }`}>
                                {details.team?.name || details.participant?.team}
                              </span>
                              <span>•</span>
                              <span>#{details.participant?.chest_number}</span>
                            </div>
                          </div>
                        </div>
                      ) : entry.chestNumber ? (
                        <div className="text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle size={13} />
                          <span>Chest #{entry.chestNumber} not found</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          Type chest number above to load student...
                        </div>
                      )}
                    </div>

                    {/* Grade & Marks Dropdowns */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Grade
                        </label>
                        <select
                          value={entry.grade}
                          onChange={e => handleUpdatePositionEntry(entry.id, { grade: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                        >
                          <option value="A+">A+ (Outstanding)</option>
                          <option value="A">A (Excellent)</option>
                          <option value="B+">B+ (Very Good)</option>
                          <option value="B">B (Good)</option>
                          <option value="C+">C+ (Fair)</option>
                          <option value="C">C (Pass)</option>
                          <option value="No Grade">No Grade</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Judge Marks (0-{maxTotalMarks})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxTotalMarks}
                          value={entry.marks}
                          onChange={e => handleUpdatePositionEntry(entry.id, { marks: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Dynamic Point Calculation Badge */}
                    {(() => {
                      const pointsCalc = calculateTotalResultPoints(
                        activeProgramme, 
                        entry.position, 
                        entry.grade, 
                        festSettings.pointScheme
                      );

                      return (
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-amber-500/10 border border-amber-500/40 flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-1.5">
                            <Trophy size={13} className="text-amber-400 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-300">Fest Points:</span>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black font-mono text-xs shadow-sm">
                              {pointsCalc.mathFormula} ({pointsCalc.totalPoints} Pts)
                            </span>
                            <div className="text-[10px] text-amber-200/80 font-medium mt-0.5">
                              {pointsCalc.breakdownText}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Quick Add Position and Add Grade Buttons at Bottom of Cards */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddPositionEntry()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <Plus size={16} className="text-amber-400" />
                  <span>+ Add Another Position (മറ്റൊരു പൊസിഷൻ ചേർക്കുക)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddGradeEntry('A')}
                  className="px-4 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/50 text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <Plus size={16} className="text-purple-400" />
                  <span>+ Add Another Grade (ഗ്രേഡ് ചേർക്കുക - Grade A/B/C)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyPositionsToTable}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/20"
              >
                <Check size={16} />
                <span>Apply Positions & Grades to Table</span>
              </button>
            </div>
          </div>

          {/* Full Participant Roster Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                <span>Participant Roster & Grades</span>
                <span className="text-xs text-amber-400 normal-case font-bold">({activeParticipants.length} registered)</span>
              </h4>

              {/* Quick Add Student Roster Tool */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={quickAddSearch}
                    onChange={e => setQuickAddSearch(e.target.value)}
                    placeholder="Search student to add..."
                    className="pl-7 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-48 sm:w-56"
                  />
                  {quickAddSearch.trim() && (
                    <div className="absolute right-0 top-full mt-1 w-72 max-h-60 overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl z-30 p-1 divide-y divide-slate-800">
                      {students
                        .filter(s => 
                          s.student_name.toLowerCase().includes(quickAddSearch.toLowerCase()) || 
                          s.chest_number.toLowerCase().includes(quickAddSearch.toLowerCase())
                        )
                        .slice(0, 8)
                        .map(s => {
                          const isAlreadyIn = activeParticipants.some(p => p.student_id === s.id || p.chest_number.toLowerCase() === s.chest_number.toLowerCase());
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleQuickAddParticipant(s.id)}
                              disabled={isAlreadyIn}
                              className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition ${
                                isAlreadyIn ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 text-white cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-white">#{s.chest_number} {s.student_name}</div>
                                <div className="text-[10px] text-slate-400">{s.category} • {s.team}</div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {isAlreadyIn ? 'In Roster' : '+ Add'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center w-12">Sl</th>
                    <th className="p-3 text-center w-28">Chest #</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center w-24">Team</th>
                    <th className="p-3 text-center w-36">Position Award</th>
                    <th className="p-3 text-center w-32">Grade Award</th>
                    <th className="p-3 text-center w-40 bg-amber-500/10 text-amber-300">Points (Pos + Grade)</th>
                    <th className="p-3 text-center w-24">Marks</th>
                    <th className="p-3 text-left min-w-[140px]">Remarks</th>
                    <th className="p-3 text-center w-24">Status</th>
                    <th className="p-3 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {activeParticipants.map((p, idx) => {
                    const student = students.find(s => s.id === p.student_id);
                    const team = teams.find(t => t.id === p.team);
                    const rowData = localRows[p.id] || { totalMarks: 0, grade: 'No Grade', position: null, remarks: '' };
                    const existingResult = activeProgrammeResults.find(r => r.participant_id === p.id);
                    const pointsCalc = calculateTotalResultPoints(
                      activeProgramme,
                      rowData.position,
                      rowData.grade,
                      festSettings.pointScheme
                    );

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        
                        {/* Sl */}
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>

                        {/* Chest Number */}
                        <td className="p-3 text-center font-mono font-extrabold text-sm text-amber-300 bg-slate-950/40">
                          #{p.chest_number}
                        </td>

                        {/* Student Name */}
                        <td className="p-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                              {student?.student_name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{formatParticipantDisplayName(student?.student_name, activeProgramme) || 'Registered Participant'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Team */}
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            p.team === 'nayro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            p.team === 'zayro' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {team?.name || p.team}
                          </span>
                        </td>

                        {/* Position Selector */}
                        <td className="p-2 text-center">
                          <select
                            value={rowData.position === null ? '' : rowData.position}
                            onChange={e => {
                              const val = e.target.value === '' ? null : Number(e.target.value) as 1 | 2 | 3;
                              handleTableRowPositionChange(p.id, val);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-xl border text-center text-xs font-black focus:outline-none transition ${
                              rowData.position === 1 ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md' :
                              rowData.position === 2 ? 'bg-slate-300 text-slate-950 border-slate-400 font-extrabold shadow-md' :
                              rowData.position === 3 ? 'bg-amber-800 text-amber-100 border-amber-700 font-extrabold shadow-md' :
                              'bg-slate-950 text-slate-400 border-slate-700'
                            }`}
                          >
                            <option value="">No Position</option>
                            <option value="1">1st Place 🥇</option>
                            <option value="2">2nd Place 🥈</option>
                            <option value="3">3rd Place 🥉</option>
                          </select>
                        </td>

                        {/* Grade Selector */}
                        <td className="p-2 text-center">
                          <select
                            value={rowData.grade}
                            onChange={e => handleTableRowGradeChange(p.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-center text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                          >
                            <option value="A+">Grade A+</option>
                            <option value="A">Grade A</option>
                            <option value="B+">Grade B+</option>
                            <option value="B">Grade B</option>
                            <option value="C+">Grade C+</option>
                            <option value="C">Grade C</option>
                            <option value="D">Grade D</option>
                            <option value="No Grade">No Grade</option>
                          </select>
                        </td>

                        {/* Calculated Fest Points with Formula breakdown */}
                        <td className="p-2 text-center bg-amber-500/5">
                          <div className="flex flex-col items-center justify-center">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border transition ${
                              pointsCalc.totalPoints > 0
                                ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                                : 'bg-slate-950 text-slate-500 border-slate-800'
                            }`}>
                              {pointsCalc.mathFormula} ({pointsCalc.totalPoints} Pts)
                            </span>
                            <span className="text-[10px] text-amber-200/75 mt-0.5 whitespace-nowrap font-medium">
                              {pointsCalc.breakdownText}
                            </span>
                            <span className="text-[9px] font-mono mt-0.5 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {pointsCalc.isGroup ? '👥 Team: +' + pointsCalc.totalPoints + ' (Group: 0 to Student)' : '👤 Student: +' + pointsCalc.studentPoints + ' | Team: +' + pointsCalc.totalPoints}
                            </span>
                          </div>
                        </td>

                        {/* Total Marks */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={maxTotalMarks}
                            value={rowData.totalMarks || ''}
                            onChange={e => handleTableRowMarksChange(p.id, e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-center text-xs font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                            placeholder="0"
                          />
                        </td>

                        {/* Remarks */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={rowData.remarks}
                            onChange={e => handleTableRowRemarksChange(p.id, e.target.value)}
                            placeholder="Optional remark..."
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
                          />
                        </td>

                        {/* Result Status */}
                        <td className="p-3 text-center">
                          {existingResult?.status === 'published' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Published
                            </span>
                          ) : existingResult?.status === 'submitted' || existingResult?.status === 'verified' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              Submitted
                            </span>
                          ) : existingResult?.status === 'draft' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Draft
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-500">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Row Delete / Clear Action */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteParticipantModal(p.id, p.chest_number, student?.student_name || 'Participant')}
                            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer"
                            title={`Delete / Clear result for Chest #${p.chest_number}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>

                      </tr>
                    );
                  })}

                  {activeParticipants.length === 0 && (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500 italic">
                        No participants registered for this event yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          {activeParticipants.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                You can add as many positions as needed (including shared 1st, 2nd, or 3rd places), award grades, and publish instantly.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenDeleteAllModal}
                  className="px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/40 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete All Results</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllDrafts}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPublishAll}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  Save & Publish to Scoreboard
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* In-App Delete Confirmation Modal (Guaranteed to work in iframe) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {deleteModal.type === 'all' 
                    ? 'Delete All Programme Results?' 
                    : `Clear Result for Chest #${deleteModal.chestNumber}?`}
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  {deleteModal.type === 'all' ? 'ഫലം പൂർണ്ണമായി റദ്ദാക്കണോ?' : 'വിദ്യാർത്ഥിയുടെ ഫലം നീക്കം ചെയ്യണോ?'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              {deleteModal.type === 'all' ? (
                <>
                  Are you sure you want to delete and reset all scores, grades, and positions for{' '}
                  <span className="font-bold text-amber-300">"{activeProgramme?.programme_name}"</span>? 
                  This will remove the published scores from the live scoreboard.
                </>
              ) : (
                <>
                  Are you sure you want to clear the marks, grade, and position for participant{' '}
                  <span className="font-bold text-amber-300">
                    Chest #{deleteModal.chestNumber} ({deleteModal.studentName})
                  </span>?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'all' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel (റദ്ദാക്കുക)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Yes, Delete Result (ഡിലീറ്റ് ചെയ്യുക)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Status Result Poster Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        programmeId={activeProgramme?.id}
      />
    </div>
  );
};
