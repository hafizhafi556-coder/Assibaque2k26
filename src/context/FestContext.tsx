import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TeamId, 
  UserRole, 
  Language, 
  ThemeMode,
  User, 
  Student, 
  Team, 
  Category, 
  Programme, 
  Participant, 
  Judge, 
  Result, 
  FestSettings, 
  Announcement, 
  Certificate,
  AuditLog,
  PointConfig,
  ProgrammeCriteriaType,
  ResultPosterRecord
} from '../types';
import { 
  INITIAL_TEAMS, 
  INITIAL_CATEGORIES, 
  INITIAL_STUDENTS, 
  INITIAL_JUDGES, 
  INITIAL_PROGRAMMES, 
  INITIAL_PARTICIPANTS, 
  INITIAL_RESULTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_FEST_SETTINGS,
  DEMO_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_POSTERS
} from '../data/initialData';

interface FestContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Authentication
  currentUser: User | null;
  loginAs: (user: User) => void;
  logout: () => void;

  // Data Collections
  teams: Team[];
  students: Student[];
  categories: Category[];
  programmes: Programme[];
  participants: Participant[];
  judges: Judge[];
  results: Result[];
  announcements: Announcement[];
  festSettings: FestSettings;
  certificates: Certificate[];
  auditLogs: AuditLog[];
  posters: ResultPosterRecord[];

  // Student CRUD & Bulk
  addStudent: (student: Omit<Student, 'id'>) => { success: boolean; error?: string };
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteMultipleStudents: (ids: string[]) => void;
  deleteAllStudents: () => void;
  bulkImportStudents: (newStudents: Omit<Student, 'id'>[]) => { successCount: number; errors: string[] };

  // Programme CRUD & Bulk
  addProgramme: (programme: Omit<Programme, 'id'>) => { success: boolean; error?: string };
  updateProgramme: (id: string, updates: Partial<Programme>) => void;
  deleteProgramme: (id: string) => void;
  deleteMultipleProgrammes: (ids: string[]) => void;
  deleteAllProgrammes: () => void;
  bulkImportProgrammes: (newProgrammes: Omit<Programme, 'id'>[], options?: { overwriteDuplicates?: boolean; autoRenameDuplicates?: boolean }) => { successCount: number; updatedCount?: number; errors: string[] };

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Participants & Attendance
  assignParticipant: (participant: Omit<Participant, 'id'>) => { success: boolean; error?: string };
  updateParticipantStatus: (id: string, status: Participant['status']) => void;
  removeParticipant: (id: string) => void;

  // Judges
  addJudge: (judge: Omit<Judge, 'id'>) => void;
  updateJudge: (id: string, updates: Partial<Judge>) => void;
  deleteJudge: (id: string) => void;
  assignJudgeToProgramme: (judgeId: string, programmeId: string) => void;

  // Results & Scoring (Judge & Admin)
  saveResultDraft: (resultData: Partial<Result> & { programme_id: string; participant_id: string; student_id: string; chest_number: string; team: TeamId; judge_id: string }) => void;
  submitJudgeResult: (resultData: Partial<Result> & { programme_id: string; participant_id: string; student_id: string; chest_number: string; team: TeamId; judge_id: string }) => void;
  verifyResult: (resultId: string) => void;
  publishResult: (resultId: string) => void;
  unpublishResult: (resultId: string) => void;
  unlockResult: (resultId: string) => void;
  deleteResult: (resultId: string) => void;
  updateResultMarks: (resultId: string, marks: number, grade: string, position: 1 | 2 | 3 | null) => void;
  calculateAutoGradeAndPositions: (programmeId: string) => void;

  // Posters (Auto-Generated Result Posters)
  generateResultPoster: (programmeId: string, customOptions?: Partial<ResultPosterRecord>) => ResultPosterRecord;
  regenerateResultPoster: (programmeId: string) => ResultPosterRecord;
  publishResultPoster: (posterId: string) => void;
  archiveResultPoster: (posterId: string) => void;
  deleteResultPoster: (posterId: string) => void;
  getPosterForProgramme: (programmeId: string) => ResultPosterRecord | undefined;

  // Announcements & Fest Settings
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  updateFestSettings: (updates: Partial<FestSettings>) => void;

  // Certificates
  generateCertificate: (data: Partial<Certificate> & { student_id: string; student_name: string; programme_id: string; programme_name: string; team: TeamId }) => Certificate;
  bulkGenerateCertificates: (dataList: Array<Partial<Certificate> & { student_id: string; student_name: string; programme_id: string; programme_name: string; team: TeamId }>) => Certificate[];
  revokeCertificate: (certId: string) => void;
  restoreCertificate: (certId: string) => void;
  deleteCertificate: (certId: string) => void;
  verifyCertificateByNumber: (certNumber: string) => Certificate | undefined;

  // Student Search / Public Lookup
  searchStudent: (query: string) => Student | null;
  getStudentResults: (studentId: string, onlyPublished?: boolean) => Result[];

  // Utilities
  resetToDemoData: () => void;
}

const FestContext = createContext<FestContextType | undefined>(undefined);

const STORAGE_PREFIX = 'isia_fest_2026_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Could not load ${key} from storage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Could not save ${key} to storage:`, e);
  }
}

// Category Normalization & Eligibility Helper
export function normalizeCategory(cat?: string): string {
  if (!cat) return '';
  const clean = cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('subjunior') || clean.includes('sub_junior')) return 'sub_junior';
  if (clean.includes('junior')) return 'junior';
  if (clean.includes('senior')) return 'senior';
  if (clean.includes('hifz') || clean.includes('hifdh') || clean.includes('tahfeez')) return 'hifz';
  if (clean.includes('general')) return 'general';
  return clean;
}

export function isStudentEligibleForProgramme(studentClass?: string, programmeCategory?: string): boolean {
  if (!programmeCategory) return true;
  const pCat = normalizeCategory(programmeCategory);
  if (pCat === 'general' || pCat === '' || pCat === 'all') return true;
  const sCat = normalizeCategory(studentClass);
  return sCat === pCat;
}

// Helper to determine if a programme is a Group / Team event (where single student represents the team with "& Team")
export function isGroupOrTeamProgramme(prg?: Programme | null): boolean {
  if (!prg) return false;
  
  const type = (prg.type || '').toLowerCase().trim();
  // If explicitly individual / single / solo, it is strictly individual -> DO NOT add "& Team"
  if (type === 'individual' || type === 'single' || type === 'solo') {
    return false;
  }

  const sec = (prg.section || '').toLowerCase().trim();
  const subCat = (prg.sub_category || '').toLowerCase().trim();
  const name = (prg.programme_name || '').toLowerCase().trim();

  // If type or section is explicitly group or team
  if (type === 'group' || type === 'team' || sec === 'group' || sec === 'team') {
    return true;
  }

  if (subCat.includes('group') || subCat.includes('team')) {
    return true;
  }

  // Keywords indicating group/ensemble performances
  if (
    name.includes('group') || 
    name.includes('duet') || 
    name.includes('trio') || 
    name.includes('mime') || 
    name.includes('skit') || 
    name.includes('chorus') || 
    name.includes('qawwali') || 
    name.includes('nasheeda') || 
    name.includes('daff') || 
    name.includes('kolkkali') || 
    name.includes('arabana') || 
    name.includes('song group') || 
    name.includes('patriotic song') ||
    name.includes('& team')
  ) {
    return true;
  }

  return false;
}

// Backward compatibility alias
export const isGroupOrGeneralProgramme = isGroupOrTeamProgramme;

// POINT CALCULATION HELPER FUNCTIONS (3-Tier Criteria + Grade Points)
// Individual: 1st=5, 2nd=3, 3rd=1
// Group: 1st=10, 2nd=5, 3rd=3
// General Group: 1st=15, 2nd=8, 3rd=5
// General Individual: 1st=5, 2nd=3, 3rd=1
// Grade: A=5, B=3, C=1
export function getProgrammeCriteriaType(prg?: Programme | null): 'individual' | 'group' | 'general' {
  if (!prg) return 'individual';
  if (prg.criteria_type) return prg.criteria_type;
  
  const category = (prg.category || '').toUpperCase();
  const isGeneral = category.includes('GENERAL') || prg.section === 'general' || prg.type === 'general';
  const isGroup = isGroupOrTeamProgramme(prg);

  if (isGeneral) {
    // General Group: 15, 8, 5
    if (isGroup) {
      return 'general';
    }
    // General Individual: 5, 3, 1
    return 'individual';
  }

  // Regular Categories (Sub Junior, Junior, Senior, Hifz, etc.)
  if (isGroup) {
    return 'group'; // Regular Group: 10, 5, 3
  }

  return 'individual'; // Regular Individual: 5, 3, 1
}

// Helper to format student display name (e.g. "Suhail & Team" ONLY for Group / Team programmes, NOT for individual programmes)
export function formatParticipantDisplayName(rawName?: string | null, prg?: Programme | null): string {
  if (!rawName || !rawName.trim()) return '';
  const trimmed = rawName.trim();
  if (isGroupOrTeamProgramme(prg)) {
    // Check if name already has & Team / and Team / Team
    if (/(?:&\s*team|\band\s+team|\bteam\b)/i.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed} & Team`;
  }
  return trimmed;
}

export function getPositionPoints(
  criteriaType: 'individual' | 'group' | 'general',
  position: 1 | 2 | 3 | null,
  pointScheme?: PointConfig
): number {
  if (!position) return 0;
  const scheme = pointScheme || INITIAL_FEST_SETTINGS.pointScheme;
  // Apply specific logic based on user criteria:
  // Individual & General Individual: (5, 3, 1)
  // Group: (10, 5, 3)
  // General Group: (15, 8, 5)
  const config = scheme[criteriaType] || (
    criteriaType === 'general' ? { first: 15, second: 8, third: 5 } :
    criteriaType === 'group' ? { first: 10, second: 5, third: 3 } :
    { first: 5, second: 3, third: 1 }
  );
  if (position === 1) return config.first ?? (criteriaType === 'general' ? 15 : criteriaType === 'group' ? 10 : 5);
  if (position === 2) return config.second ?? (criteriaType === 'general' ? 8 : criteriaType === 'group' ? 5 : 3);
  if (position === 3) return config.third ?? (criteriaType === 'general' ? 5 : criteriaType === 'group' ? 3 : 1);
  return 0;
}

// Check if a programme is eligible for individual student points (Individual or General Individual)
// Rule:
// - Individual & General Individual -> Points awarded to Students & Teams
// - Group & General Group -> Points awarded to Teams ONLY (0 points to students)
export function isStudentScoringProgramme(prg?: Programme | null): boolean {
  if (!prg) return true;
  return !isGroupOrTeamProgramme(prg);
}

// Filters points for individual students: excludes Group and General Group points.
export function getStudentPoints(
  prgOrCriteriaType: Programme | 'individual' | 'group' | 'general' | null | undefined,
  totalPoints: number
): number {
  if (!prgOrCriteriaType) return totalPoints;
  if (typeof prgOrCriteriaType === 'object') {
    return isGroupOrTeamProgramme(prgOrCriteriaType) ? 0 : totalPoints;
  }
  // If string criteriaType is 'group' (Regular Group) or 'general' (General Group)
  if (prgOrCriteriaType === 'group' || prgOrCriteriaType === 'general') {
    return 0;
  }
  return totalPoints;
}

export function getGradePoints(grade: string | undefined | null, pointScheme?: PointConfig): number {
  if (!grade) return 0;
  const cleanGrade = grade.trim().toUpperCase();
  const scheme = pointScheme || INITIAL_FEST_SETTINGS.pointScheme;
  const gradeConfig = scheme.grades || { A: 5, B: 3, C: 1 };
  if (cleanGrade.startsWith('A')) return gradeConfig.A ?? 5;
  if (cleanGrade.startsWith('B')) return gradeConfig.B ?? 3;
  if (cleanGrade.startsWith('C')) return gradeConfig.C ?? 1;
  return 0;
}

export function calculateTotalResultPoints(
  prg: Programme | undefined | null,
  position: 1 | 2 | 3 | null,
  grade: string | undefined | null,
  pointScheme?: PointConfig
): {
  positionPoints: number;
  gradePoints: number;
  totalPoints: number;
  studentPoints: number;
  isGroup: boolean;
  isGeneralIndividual: boolean;
  criteriaType: 'individual' | 'group' | 'general';
  mathFormula: string;
  breakdownText: string;
  criteriaLabel: string;
} {
  const criteriaType = getProgrammeCriteriaType(prg);
  const isGroup = isGroupOrTeamProgramme(prg);
  const categoryStr = (prg?.category || '').toUpperCase();
  const isGeneral = categoryStr.includes('GENERAL') || prg?.section === 'general' || prg?.type === 'general';
  const isGeneralIndividual = isGeneral && !isGroup;

  const positionPoints = getPositionPoints(criteriaType, position, pointScheme);
  const gradePoints = getGradePoints(grade, pointScheme);
  const participationPoints = (!position && !gradePoints) ? (pointScheme?.participation || 0) : 0;
  const totalPoints = positionPoints + gradePoints + participationPoints;

  // Student points rule: 
  // Individual & General Individual -> gets totalPoints
  // Group & General Group -> 0 (team only)
  const studentPoints = isGroup ? 0 : totalPoints;

  const criteriaLabel = 
    criteriaType === 'general' ? 'General Group (1st=15, 2nd=8, 3rd=5)' :
    criteriaType === 'group' ? 'Group Event (1st=10, 2nd=5, 3rd=3)' :
    isGeneralIndividual ? 'General Individual (1st=5, 2nd=3, 3rd=1)' :
    'Individual Event (1st=5, 2nd=3, 3rd=1)';

  let mathFormula = `${totalPoints}`;
  let breakdownText = `${totalPoints} Pts`;

  if (position && gradePoints > 0) {
    mathFormula = `${positionPoints}+${gradePoints}=${totalPoints}`;
    const posName = position === 1 ? '1st' : position === 2 ? '2nd' : '3rd';
    breakdownText = `${positionPoints} (${posName}) + ${gradePoints} (Grade) = ${totalPoints} Pts`;
  } else if (position) {
    mathFormula = `${positionPoints}`;
    const posName = position === 1 ? '1st' : position === 2 ? '2nd' : '3rd';
    breakdownText = `${positionPoints} (${posName} Place) = ${totalPoints} Pts`;
  } else if (gradePoints > 0) {
    mathFormula = `0+${gradePoints}=${totalPoints}`;
    breakdownText = `${gradePoints} (Grade) = ${totalPoints} Pts`;
  } else if (totalPoints > 0) {
    mathFormula = `${totalPoints}`;
    breakdownText = `${totalPoints} Pts`;
  } else {
    mathFormula = `0`;
    breakdownText = `0 Pts`;
  }

  return {
    positionPoints,
    gradePoints,
    totalPoints,
    studentPoints,
    isGroup,
    isGeneralIndividual,
    criteriaType,
    mathFormula,
    breakdownText,
    criteriaLabel,
  };
}

export const FestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => loadFromStorage('lang', 'en'));
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = loadFromStorage('theme', null);
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('user', null));

  // Sync theme class to documentElement and store
  useEffect(() => {
    saveToStorage('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Entities state
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', INITIAL_STUDENTS));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', INITIAL_CATEGORIES));
  const [programmes, setProgrammes] = useState<Programme[]>(() => loadFromStorage('programmes', INITIAL_PROGRAMMES));
  const [participants, setParticipants] = useState<Participant[]>(() => loadFromStorage('participants', INITIAL_PARTICIPANTS));
  const [judges, setJudges] = useState<Judge[]>(() => loadFromStorage('judges', INITIAL_JUDGES));
  const [results, setResults] = useState<Result[]>(() => loadFromStorage('results', INITIAL_RESULTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('announcements', INITIAL_ANNOUNCEMENTS));
  const [festSettings, setFestSettings] = useState<FestSettings>(() => {
    const saved = loadFromStorage('settings', INITIAL_FEST_SETTINGS);
    if (!saved || saved.festTheme?.includes('RIHLA') || saved.festName?.includes('IMAM SHAFI') || !saved.festLogo || !saved.pointScheme?.individual || !saved.pointScheme?.grades) {
      return {
        ...INITIAL_FEST_SETTINGS,
        festName: 'തനിമിയ്യത്ത്',
        festNameMl: 'തനിമിയ്യത്ത്',
        festTheme: 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
        festThemeMl: 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
        festLogo: '/thanimiyyath-logo.svg',
        pointScheme: INITIAL_FEST_SETTINGS.pointScheme,
      };
    }
    if (saved.contactInformation && (saved.contactInformation.includes('98470') || saved.contactInformation.includes('imamshafi.edu') || saved.contactInformation.includes('Kozhikode'))) {
      saved.contactInformation = 'Kasaragod, Kerala';
    }
    return saved;
  });
  const [certificates, setCertificates] = useState<Certificate[]>(() => loadFromStorage('certificates', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS));
  const [posters, setPosters] = useState<ResultPosterRecord[]>(() => loadFromStorage('posters', INITIAL_POSTERS));

  // Save changes
  useEffect(() => saveToStorage('lang', language), [language]);
  useEffect(() => saveToStorage('user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('students', students), [students]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('programmes', programmes), [programmes]);
  useEffect(() => saveToStorage('participants', participants), [participants]);
  useEffect(() => saveToStorage('judges', judges), [judges]);
  useEffect(() => saveToStorage('results', results), [results]);
  useEffect(() => saveToStorage('announcements', announcements), [announcements]);
  useEffect(() => saveToStorage('settings', festSettings), [festSettings]);
  useEffect(() => saveToStorage('certificates', certificates), [certificates]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('posters', posters), [posters]);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => (prev === 'en' ? 'ml' : 'en'));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const loginAs = useCallback((user: User) => {
    setCurrentUser(user);
    logAuditAction('User Login', `Logged in as ${user.name} (${user.role})`, user.name, user.role);
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      logAuditAction('User Logout', `User ${currentUser.name} signed out`, currentUser.name, currentUser.role);
    }
    setCurrentUser(null);
  }, [currentUser]);

  const logAuditAction = useCallback((action: string, details: string, performedBy = 'System', role = 'system') => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      performedBy,
      role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // AUTOMATIC DYNAMIC CALCULATION OF TEAMS POINTS & RANKING
  // Teams points are calculated strictly from PUBLISHED results according to festSettings.pointScheme!
  const teams = useMemo<Team[]>(() => {
    const pointScheme = festSettings.pointScheme || INITIAL_FEST_SETTINGS.pointScheme;

    const computedTeams = INITIAL_TEAMS.map(baseTeam => {
      // Find all published results for this team
      const teamPublishedResults = results.filter(r => r.team === baseTeam.id && r.status === 'published');

      let totalPoints = 0;
      let goldCount = 0;
      let silverCount = 0;
      let bronzeCount = 0;

      teamPublishedResults.forEach(r => {
        const prg = programmes.find(p => p.id === r.programme_id);
        const { totalPoints: itemPoints } = calculateTotalResultPoints(prg, r.position, r.grade, pointScheme);
        totalPoints += itemPoints;

        if (r.position === 1) {
          goldCount += 1;
        } else if (r.position === 2) {
          silverCount += 1;
        } else if (r.position === 3) {
          bronzeCount += 1;
        }
      });

      const studentsCount = students.filter(s => s.team === baseTeam.id).length;
      const programsCount = participants.filter(p => p.team === baseTeam.id).length;
      const completedResultsCount = teamPublishedResults.length;

      return {
        ...baseTeam,
        totalPoints,
        goldCount,
        silverCount,
        bronzeCount,
        studentsCount,
        programsCount,
        completedResultsCount,
        rank: 1, // calculated next
      };
    });

    // Sort teams by total points descending, tie-breaker: goldCount, then silverCount
    computedTeams.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
      return b.silverCount - a.silverCount;
    });

    // Assign rank
    return computedTeams.map((team, idx) => ({
      ...team,
      rank: idx + 1,
    }));
  }, [results, students, participants, programmes, festSettings.pointScheme]);

  // STUDENT MANAGEMENT
  const addStudent = useCallback((newStudentData: Omit<Student, 'id'>) => {
    // Validate uniqueness of chest_number and student_id
    const existingChest = students.find(s => s.chest_number.trim().toLowerCase() === newStudentData.chest_number.trim().toLowerCase());
    if (existingChest) {
      return { success: false, error: `Chest number "${newStudentData.chest_number}" already exists for ${existingChest.student_name}.` };
    }
    const existingId = students.find(s => s.student_id.trim().toLowerCase() === newStudentData.student_id.trim().toLowerCase());
    if (existingId) {
      return { success: false, error: `Student ID "${newStudentData.student_id}" is already registered.` };
    }

    const student: Student = {
      ...newStudentData,
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setStudents(prev => [student, ...prev]);
    logAuditAction('Student Added', `Added student ${student.student_name} (${student.chest_number}, Team: ${student.team.toUpperCase()})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
    return { success: true };
  }, [students, currentUser, logAuditAction]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    }));
    logAuditAction('Student Updated', `Updated student details (ID: ${id})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const deleteStudent = useCallback((id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setParticipants(prev => prev.filter(p => p.student_id !== id));
    setResults(prev => prev.filter(r => r.student_id !== id));
    logAuditAction('Student Deleted', `Removed student ${student?.student_name || id} (${student?.chest_number || ''})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [students, currentUser, logAuditAction]);

  const deleteMultipleStudents = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setStudents(prev => prev.filter(s => !idSet.has(s.id)));
    setParticipants(prev => prev.filter(p => !idSet.has(p.student_id)));
    setResults(prev => prev.filter(r => !idSet.has(r.student_id)));
    logAuditAction('Bulk Students Deleted', `Removed ${ids.length} student records from the database.`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const deleteAllStudents = useCallback(() => {
    const count = students.length;
    setStudents([]);
    setParticipants([]);
    setResults([]);
    logAuditAction('All Students Deleted', `Cleared entire student roster (${count} students removed).`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [students.length, currentUser, logAuditAction]);

  const bulkImportStudents = useCallback((importedList: Omit<Student, 'id'>[]) => {
    const validTeams: TeamId[] = ['nayro', 'zayro', 'lucero'];
    const existingChestSet = new Set(students.map(s => s.chest_number.trim().toLowerCase()));
    const existingIdSet = new Set(students.map(s => s.student_id.trim().toLowerCase()));

    const validNewStudents: Student[] = [];
    const errors: string[] = [];

    importedList.forEach((row, idx) => {
      const lineNum = idx + 1;
      const chest = row.chest_number?.trim();
      const sId = row.student_id?.trim();
      const team = row.team?.toLowerCase() as TeamId;

      if (!chest) {
        errors.push(`Row ${lineNum}: Missing chest number`);
        return;
      }
      if (!sId) {
        errors.push(`Row ${lineNum}: Missing student ID`);
        return;
      }
      if (!row.student_name?.trim()) {
        errors.push(`Row ${lineNum}: Missing student name`);
        return;
      }
      if (!validTeams.includes(team)) {
        errors.push(`Row ${lineNum}: Invalid team "${row.team}". Must be NAYRO, ZAYRO, or LUCERO`);
        return;
      }
      if (existingChestSet.has(chest.toLowerCase())) {
        errors.push(`Row ${lineNum}: Duplicate chest number "${chest}" already in database or current file`);
        return;
      }
      if (existingIdSet.has(sId.toLowerCase())) {
        errors.push(`Row ${lineNum}: Duplicate student ID "${sId}" already in database or current file`);
        return;
      }

      existingChestSet.add(chest.toLowerCase());
      existingIdSet.add(sId.toLowerCase());

      validNewStudents.push({
        ...row,
        id: 'stu-bulk-' + Date.now() + '-' + idx,
        chest_number: chest,
        student_id: sId,
        team,
        status: row.status || 'active',
      });
    });

    if (validNewStudents.length > 0) {
      setStudents(prev => [...validNewStudents, ...prev]);
      logAuditAction('Bulk Student Import', `Successfully imported ${validNewStudents.length} student records. (${errors.length} skipped with errors)`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
    }

    return { successCount: validNewStudents.length, errors };
  }, [students, currentUser, logAuditAction]);

  // PROGRAMME MANAGEMENT
  const addProgramme = useCallback((newPrgData: Omit<Programme, 'id'>) => {
    const existingCode = programmes.find(p => p.programme_code.trim().toLowerCase() === newPrgData.programme_code.trim().toLowerCase());
    if (existingCode) {
      return { success: false, error: `Programme code "${newPrgData.programme_code}" already exists.` };
    }

    const prg: Programme = {
      ...newPrgData,
      id: 'prg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setProgrammes(prev => [prg, ...prev]);
    logAuditAction('Programme Created', `Created programme: ${prg.programme_name} (${prg.programme_code})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
    return { success: true };
  }, [programmes, currentUser, logAuditAction]);

  const updateProgramme = useCallback((id: string, updates: Partial<Programme>) => {
    setProgrammes(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    logAuditAction('Programme Updated', `Modified programme (ID: ${id})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const deleteProgramme = useCallback((id: string) => {
    const p = programmes.find(item => item.id === id);
    setProgrammes(prev => prev.filter(item => item.id !== id));
    setParticipants(prev => prev.filter(part => part.programme_id !== id));
    setResults(prev => prev.filter(r => r.programme_id !== id));
    logAuditAction('Programme Deleted', `Deleted programme ${p?.programme_name || id} (${p?.programme_code || ''})`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [programmes, currentUser, logAuditAction]);

  const deleteMultipleProgrammes = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setProgrammes(prev => prev.filter(p => !idSet.has(p.id)));
    setParticipants(prev => prev.filter(part => !idSet.has(part.programme_id)));
    setResults(prev => prev.filter(r => !idSet.has(r.programme_id)));
    logAuditAction('Bulk Programmes Deleted', `Deleted ${ids.length} programmes from database.`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const deleteAllProgrammes = useCallback(() => {
    const count = programmes.length;
    setProgrammes([]);
    setParticipants([]);
    setResults([]);
    logAuditAction('All Programmes Deleted', `Cleared all programmes (${count} events removed).`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [programmes.length, currentUser, logAuditAction]);

  const bulkImportProgrammes = useCallback((
    importedList: Omit<Programme, 'id'>[],
    options?: { overwriteDuplicates?: boolean; autoRenameDuplicates?: boolean }
  ) => {
    const existingCodeMap = new Map(programmes.map(p => [p.programme_code.trim().toLowerCase(), p]));
    const validProgrammes: Programme[] = [];
    const updatedProgrammes: Programme[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let updatedCount = 0;

    importedList.forEach((row, idx) => {
      const lineNum = idx + 1;
      let code = row.programme_code?.trim();
      const name = row.programme_name?.trim();

      if (!name) {
        errors.push(`Row ${lineNum}: Missing programme name`);
        return;
      }

      if (!code) {
        // Auto-assign code if missing
        code = `EVT-${100 + programmes.length + validProgrammes.length + 1}`;
      }

      const lowerCode = code.toLowerCase();
      const existing = existingCodeMap.get(lowerCode);

      if (existing) {
        if (options?.overwriteDuplicates) {
          updatedProgrammes.push({
            ...existing,
            ...row,
            programme_code: existing.programme_code,
            id: existing.id,
          });
          updatedCount++;
          return;
        } else if (options?.autoRenameDuplicates) {
          let suffix = 1;
          let candidate = `${code}-${suffix}`;
          while (existingCodeMap.has(candidate.toLowerCase())) {
            suffix++;
            candidate = `${code}-${suffix}`;
          }
          code = candidate;
          existingCodeMap.set(code.toLowerCase(), {} as any);
        } else {
          errors.push(`Row ${lineNum}: Duplicate programme code "${code}" (skipped)`);
          return;
        }
      } else {
        existingCodeMap.set(lowerCode, {} as any);
      }

      validProgrammes.push({
        ...row,
        id: 'prg-bulk-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
        programme_code: code,
        programme_name: name,
        status: row.status || 'scheduled',
        criteria: row.criteria && row.criteria.length > 0 ? row.criteria : [
          { id: 'crit-gen-1', name: 'Content & Knowledge', maxMarks: 25 },
          { id: 'crit-gen-2', name: 'Presentation & Style', maxMarks: 25 },
          { id: 'crit-gen-3', name: 'Language & Diction', maxMarks: 25 },
          { id: 'crit-gen-4', name: 'Overall Impression', maxMarks: 25 },
        ],
      });
      successCount++;
    });

    if (validProgrammes.length > 0 || updatedProgrammes.length > 0) {
      setProgrammes(prev => {
        let list = prev;
        if (updatedProgrammes.length > 0) {
          const updateMap = new Map(updatedProgrammes.map(u => [u.id, u]));
          list = list.map(p => updateMap.get(p.id) || p);
        }
        return [...validProgrammes, ...list];
      });
      logAuditAction('Bulk Programme Import', `Imported ${successCount} programmes, updated ${updatedCount} existing.`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
    }

    return { successCount, updatedCount, errors };
  }, [programmes, currentUser, logAuditAction]);

  // CATEGORY MANAGEMENT
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    setCategories(prev => [...prev, newCat]);
    logAuditAction('Category Added', `Added category: ${newCat.name}`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // PARTICIPANT ASSIGNMENT
  const assignParticipant = useCallback((data: Omit<Participant, 'id'>) => {
    // Check if registration is locked by Fest Admin
    if (festSettings.registration_locked && currentUser?.role !== 'admin') {
      const lockMsg = language === 'ml' 
        ? (festSettings.registration_lock_message_ml || 'പ്രോഗ്രാം രജിസ്ട്രേഷൻ അഡ്മിനിസ്ട്രേഷൻ ലോക്ക് ചെയ്തിരിക്കുന്നു.')
        : (festSettings.registration_lock_message || 'Programme Registration has been locked by Fest Administration.');
      return { success: false, error: `🔒 ${lockMsg}` };
    }

    // Check if programme is group or individual
    const prg = programmes.find(p => p.id === data.programme_id);
    if (prg?.type === 'individual') {
      const alreadyRegistered = participants.find(p => p.programme_id === data.programme_id && p.student_id === data.student_id);
      if (alreadyRegistered) {
        return { success: false, error: 'This student is already registered for this individual event.' };
      }
    }

    const participant: Participant = {
      ...data,
      id: 'part-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setParticipants(prev => [...prev, participant]);
    return { success: true };
  }, [programmes, participants, festSettings.registration_locked, festSettings.registration_lock_message, festSettings.registration_lock_message_ml, currentUser?.role, language]);

  const updateParticipantStatus = useCallback((id: string, status: Participant['status']) => {
    setParticipants(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
  }, []);

  const removeParticipant = useCallback((id: string) => {
    if (festSettings.registration_locked && currentUser?.role !== 'admin') {
      return { success: false, error: 'Programme registration is locked.' };
    }
    setParticipants(prev => prev.filter(p => p.id !== id));
    return { success: true };
  }, [festSettings.registration_locked, currentUser?.role]);

  // JUDGE MANAGEMENT
  const addJudge = useCallback((data: Omit<Judge, 'id'>) => {
    const judge: Judge = {
      ...data,
      id: 'jdg-' + Date.now(),
    };
    setJudges(prev => [...prev, judge]);
    logAuditAction('Judge Registered', `Registered judge ${judge.name}`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  const updateJudge = useCallback((id: string, updates: Partial<Judge>) => {
    setJudges(prev => prev.map(j => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const deleteJudge = useCallback((id: string) => {
    setJudges(prev => prev.filter(j => j.id !== id));
  }, []);

  const assignJudgeToProgramme = useCallback((judgeId: string, programmeId: string) => {
    setProgrammes(prev => prev.map(p => (p.id === programmeId ? { ...p, judge_id: judgeId } : p)));
    setJudges(prev => prev.map(j => {
      if (j.id === judgeId && !j.assignedProgrammes.includes(programmeId)) {
        return { ...j, assignedProgrammes: [...j.assignedProgrammes, programmeId] };
      }
      return j;
    }));
    logAuditAction('Judge Assigned', `Assigned judge to programme ID: ${programmeId}`, currentUser?.name || 'Admin', currentUser?.role || 'admin');
  }, [currentUser, logAuditAction]);

  // RESULT & SCORING SYSTEM
  const calculateGrade = (total: number, max: number): string => {
    const pct = (total / (max || 100)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 40) return 'C';
    return 'D';
  };

  const saveResultDraft = useCallback((data: Partial<Result> & { programme_id: string; participant_id: string; student_id: string; chest_number: string; team: TeamId; judge_id: string }) => {
    const scores = data.scores || {};
    const total_marks = Object.values(scores).reduce((sum, m) => sum + (Number(m) || 0), 0);
    const prg = programmes.find(p => p.id === data.programme_id);
    const grade = data.grade || calculateGrade(total_marks, prg?.maximum_marks || 100);
    const position = data.position !== undefined ? data.position : null;
    const pointScheme = festSettings.pointScheme || INITIAL_FEST_SETTINGS.pointScheme;
    const { totalPoints } = calculateTotalResultPoints(prg, position, grade, pointScheme);

    setResults(prev => {
      const existingIdx = prev.findIndex(r => r.programme_id === data.programme_id && r.participant_id === data.participant_id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...data,
          scores,
          total_marks: data.total_marks !== undefined ? data.total_marks : total_marks,
          grade,
          position,
          points_awarded: totalPoints,
          status: 'draft',
          is_locked: false,
        };
        return updated;
      } else {
        const newResult: Result = {
          id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          result_id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
          programme_id: data.programme_id,
          participant_id: data.participant_id,
          student_id: data.student_id,
          chest_number: data.chest_number,
          team: data.team,
          scores,
          total_marks: data.total_marks !== undefined ? data.total_marks : total_marks,
          grade,
          position,
          points_awarded: totalPoints,
          judge_id: data.judge_id,
          remarks: data.remarks || '',
          status: 'draft',
          is_locked: false,
        };
        return [...prev, newResult];
      }
    });
  }, [programmes, festSettings.pointScheme]);

  const submitJudgeResult = useCallback((data: Partial<Result> & { programme_id: string; participant_id: string; student_id: string; chest_number: string; team: TeamId; judge_id: string }) => {
    const scores = data.scores || {};
    const total_marks = Object.values(scores).reduce((sum, m) => sum + (Number(m) || 0), 0);
    const prg = programmes.find(p => p.id === data.programme_id);
    const grade = data.grade || calculateGrade(total_marks, prg?.maximum_marks || 100);
    const position = data.position !== undefined ? data.position : null;
    const pointScheme = festSettings.pointScheme || INITIAL_FEST_SETTINGS.pointScheme;
    const { totalPoints } = calculateTotalResultPoints(prg, position, grade, pointScheme);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setResults(prev => {
      const existingIdx = prev.findIndex(r => r.programme_id === data.programme_id && r.participant_id === data.participant_id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...data,
          scores,
          total_marks: data.total_marks !== undefined ? data.total_marks : total_marks,
          grade,
          position,
          points_awarded: totalPoints,
          status: 'submitted',
          is_locked: true,
          submitted_date: nowStr,
        };
        return updated;
      } else {
        const newResult: Result = {
          id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          result_id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
          programme_id: data.programme_id,
          participant_id: data.participant_id,
          student_id: data.student_id,
          chest_number: data.chest_number,
          team: data.team,
          scores,
          total_marks: data.total_marks !== undefined ? data.total_marks : total_marks,
          grade,
          position,
          points_awarded: totalPoints,
          judge_id: data.judge_id,
          remarks: data.remarks || '',
          status: 'submitted',
          is_locked: true,
          submitted_date: nowStr,
        };
        return [...prev, newResult];
      }
    });

    logAuditAction('Judge Submitted Result', `Judge submitted evaluation for participant ${data.chest_number} in programme ${prg?.programme_name || data.programme_id}`, currentUser?.name || 'Judge', 'judge');
  }, [programmes, festSettings.pointScheme, currentUser, logAuditAction]);

  // AUTOMATIC RANK / POSITION ASSIGNMENT FOR A PROGRAMME
  const calculateAutoGradeAndPositions = useCallback((programmeId: string) => {
    setResults(prev => {
      const prgResults = prev.filter(r => r.programme_id === programmeId);
      if (prgResults.length === 0) return prev;

      const prg = programmes.find(p => p.id === programmeId);

      // Sort by total marks descending
      const sorted = [...prgResults].sort((a, b) => b.total_marks - a.total_marks);

      // Assign position 1, 2, 3 based on scores
      const positionMap = new Map<string, 1 | 2 | 3 | null>();
      sorted.forEach((r, idx) => {
        if (idx === 0 && r.total_marks > 0) positionMap.set(r.id, 1);
        else if (idx === 1 && r.total_marks > 0) positionMap.set(r.id, 2);
        else if (idx === 2 && r.total_marks > 0) positionMap.set(r.id, 3);
        else positionMap.set(r.id, null);
      });

      const pointScheme = festSettings.pointScheme || INITIAL_FEST_SETTINGS.pointScheme;

      return prev.map(r => {
        if (r.programme_id === programmeId) {
          const pos = positionMap.get(r.id) || null;
          const { totalPoints } = calculateTotalResultPoints(prg, pos, r.grade, pointScheme);

          return {
            ...r,
            position: pos,
            points_awarded: totalPoints,
          };
        }
        return r;
      });
    });
  }, [programmes, festSettings.pointScheme]);

  const generateResultPoster = useCallback((programmeId: string, customOptions?: Partial<ResultPosterRecord>): ResultPosterRecord => {
    const prg = programmes.find(p => p.id === programmeId);
    const existingIndex = posters.findIndex(p => p.programme_id === programmeId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newPosterRecord: ResultPosterRecord = {
      poster_id: existingIndex >= 0 ? posters[existingIndex].poster_id : 'post-' + programmeId + '-' + Date.now(),
      programme_id: programmeId,
      generated_at: nowStr,
      generated_by: currentUser?.name || 'Chief Controller',
      status: 'Published',
      aspect_ratio: customOptions?.aspect_ratio || '4:5',
      institution_name: festSettings.institutionName,
      fest_name: festSettings.festName,
      fest_motto: festSettings.festTheme,
      fest_year: festSettings.festYear,
      fest_logo: festSettings.festLogo,
      ...customOptions,
    };

    setPosters(prev => {
      const idx = prev.findIndex(p => p.programme_id === programmeId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newPosterRecord;
        return updated;
      }
      return [newPosterRecord, ...prev];
    });

    logAuditAction(
      'Result Poster Generated',
      `Auto-generated official result poster for ${prg?.programme_code || ''} ${prg?.programme_name || programmeId}`,
      currentUser?.name || 'System',
      currentUser?.role || 'admin'
    );

    return newPosterRecord;
  }, [programmes, posters, festSettings, currentUser, logAuditAction]);

  const regenerateResultPoster = useCallback((programmeId: string): ResultPosterRecord => {
    return generateResultPoster(programmeId, { status: 'Published' });
  }, [generateResultPoster]);

  const publishResultPoster = useCallback((posterId: string) => {
    setPosters(prev => prev.map(p => (p.poster_id === posterId ? { ...p, status: 'Published' } : p)));
    logAuditAction('Poster Published', `Published result poster ${posterId}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const archiveResultPoster = useCallback((posterId: string) => {
    setPosters(prev => prev.map(p => (p.poster_id === posterId ? { ...p, status: 'Archived' } : p)));
    logAuditAction('Poster Archived', `Archived result poster ${posterId}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const deleteResultPoster = useCallback((posterId: string) => {
    setPosters(prev => prev.filter(p => p.poster_id !== posterId));
    logAuditAction('Poster Deleted', `Deleted result poster record ${posterId}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const getPosterForProgramme = useCallback((programmeId: string): ResultPosterRecord | undefined => {
    return posters.find(p => p.programme_id === programmeId && p.status !== 'Archived');
  }, [posters]);

  const verifyResult = useCallback((resultId: string) => {
    setResults(prev => prev.map(r => (r.id === resultId ? { ...r, status: 'verified', verified_by: currentUser?.name || 'Admin' } : r)));
    logAuditAction('Result Verified', `Result verified by ${currentUser?.name || 'Admin'} (Result ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const publishResult = useCallback((resultId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // Find result and programme
    const res = results.find(r => r.id === resultId);
    const programmeId = res?.programme_id;

    setResults(prev => prev.map(r => (r.id === resultId ? { ...r, status: 'published', published_date: nowStr, published_by: currentUser?.name || 'Admin' } : r)));
    logAuditAction('Result Published', `Result published for public viewing (Result ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');

    // POSTER TRIGGER AUTOMATION:
    // Generate the poster automatically ONLY when Judge submits result -> Admin verifies result -> Admin publishes result
    if (programmeId) {
      setTimeout(() => {
        generateResultPoster(programmeId, { status: 'Published' });
      }, 50);
    }
  }, [results, currentUser, logAuditAction, generateResultPoster]);

  const unpublishResult = useCallback((resultId: string) => {
    const res = results.find(r => r.id === resultId);
    const programmeId = res?.programme_id;

    setResults(prev => prev.map(r => (r.id === resultId ? { ...r, status: 'verified' } : r)));
    logAuditAction('Result Unpublished', `Result hidden from public (Result ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');

    // If no published results remain for this programme, set poster to Archived
    if (programmeId) {
      setTimeout(() => {
        setResults(currentResults => {
          const hasOtherPublished = currentResults.some(r => r.programme_id === programmeId && r.id !== resultId && r.status === 'published');
          if (!hasOtherPublished) {
            setPosters(prevP => prevP.map(p => p.programme_id === programmeId ? { ...p, status: 'Archived' } : p));
          }
          return currentResults;
        });
      }, 50);
    }
  }, [results, currentUser, logAuditAction]);

  const unlockResult = useCallback((resultId: string) => {
    setResults(prev => prev.map(r => (r.id === resultId ? { ...r, is_locked: false, status: 'draft' } : r)));
    logAuditAction('Result Unlocked', `Admin unlocked scoring sheet for editing (Result ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const deleteResult = useCallback((resultId: string) => {
    setResults(prev => prev.filter(r => r.id !== resultId));
    logAuditAction('Result Deleted', `Admin deleted result (ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const updateResultMarks = useCallback((resultId: string, marks: number, grade: string, position: 1 | 2 | 3 | null) => {
    const pointScheme = festSettings.pointScheme || INITIAL_FEST_SETTINGS.pointScheme;
    setResults(prev => {
      const existing = prev.find(r => r.id === resultId);
      const prg = programmes.find(p => p.id === existing?.programme_id);
      const { totalPoints } = calculateTotalResultPoints(prg, position, grade, pointScheme);

      return prev.map(r => (r.id === resultId ? {
        ...r,
        total_marks: marks,
        grade,
        position,
        points_awarded: totalPoints,
      } : r));
    });
    logAuditAction('Result Marks Edited', `Admin modified marks to ${marks}, pos: ${position || 'None'}, grade: ${grade} (Result ID: ${resultId})`, currentUser?.name || 'Admin', 'admin');
  }, [programmes, festSettings.pointScheme, currentUser, logAuditAction]);

  // ANNOUNCEMENTS
  const addAnnouncement = useCallback((data: Omit<Announcement, 'id' | 'timestamp'>) => {
    const ann: Announcement = {
      ...data,
      id: 'ann-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isPinned: data.isPinned || data.is_pinned || false,
      is_pinned: data.isPinned || data.is_pinned || false,
    };
    setAnnouncements(prev => [ann, ...prev]);
    logAuditAction('Announcement Posted', `New announcement: ${ann.title}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const togglePinAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.map(a => (a.id === id ? {
      ...a,
      isPinned: !a.isPinned,
      is_pinned: !a.isPinned,
    } : a)));
  }, []);

  const updateFestSettings = useCallback((updates: Partial<FestSettings>) => {
    setFestSettings(prev => ({ ...prev, ...updates }));
    logAuditAction('Settings Updated', `Admin updated fest settings and rules`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  // CERTIFICATES
  const generateCertificate = useCallback((data: Partial<Certificate> & { student_id: string; student_name: string; programme_id: string; programme_name: string; team: TeamId }) => {
    const prefix = festSettings.certificate_prefix || `ISA-AF-${festSettings.festYear || '2026'}-`;
    const count = (certificates.length + 1).toString().padStart(4, '0');
    const certNum = data.certificate_number || `${prefix}${count}`;

    const isAchievement = data.position && data.position > 0;
    const certType: Certificate['certificate_type'] = data.certificate_type || (isAchievement ? 'achievement' : 'participation');

    const newCert: Certificate = {
      id: data.id || ('cert-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
      certificate_number: certNum,
      certificate_type: certType,
      title: data.title || (certType === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : certType === 'special_award' ? 'SPECIAL AWARD CERTIFICATE' : 'CERTIFICATE OF PARTICIPATION'),
      student_id: data.student_id,
      student_name: data.student_name,
      chest_number: data.chest_number || '',
      class_name: data.class_name || '',
      student_photo: data.student_photo || '',
      programme_id: data.programme_id,
      programme_code: data.programme_code || '',
      programme_name: data.programme_name,
      category: data.category || '',
      position: data.position ?? null,
      grade: data.grade || '',
      marks: data.marks,
      max_marks: data.max_marks || 100,
      special_award_name: data.special_award_name || '',
      team: data.team,
      team_name: data.team_name || (data.team ? data.team.toUpperCase() : ''),
      fest_name: data.fest_name || festSettings.festName,
      fest_motto: data.fest_motto || festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
      fest_logo: data.fest_logo || festSettings.festLogo || '/thanimiyyath-logo.svg',
      year: data.year || festSettings.festYear || '2026',
      date: data.date || festSettings.certificate_issue_date || new Date().toISOString().substring(0, 10),
      institution_name: data.institution_name || festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY',
      fest_controller_name: data.fest_controller_name || festSettings.fest_controller_name || 'IQBAL ASSHAFI',
      fest_controller_designation: data.fest_controller_designation || festSettings.fest_controller_designation || 'Fest Controller',
      fest_controller_signature: data.fest_controller_signature || festSettings.fest_controller_signature || '',
      vice_principal_name: data.vice_principal_name || festSettings.vice_principal_name || "RAFI ASH'ARY",
      vice_principal_designation: data.vice_principal_designation || festSettings.vice_principal_designation || 'Vice Principal',
      vice_principal_signature: data.vice_principal_signature || festSettings.vice_principal_signature || '',
      theme: data.theme || festSettings.certificate_theme || 'emerald',
      show_photo: data.show_photo ?? festSettings.certificate_show_photo ?? true,
      show_qr: data.show_qr ?? festSettings.certificate_show_qr ?? true,
      show_marks: data.show_marks ?? festSettings.certificate_show_marks ?? true,
      show_grade: data.show_grade ?? festSettings.certificate_show_grade ?? true,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      qr_verification_url: `/verify-certificate?number=${encodeURIComponent(certNum)}`
    };

    setCertificates(prev => {
      // If already exists with same student_id and programme_id, update it; otherwise prepend
      const existingIdx = prev.findIndex(c => (c.student_id === newCert.student_id && c.programme_id === newCert.programme_id) || c.certificate_number === newCert.certificate_number);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newCert;
        return next;
      }
      return [newCert, ...prev];
    });

    logAuditAction('Certificate Issued', `Generated Certificate #${certNum} for ${data.student_name} (${data.programme_name})`, currentUser?.name || 'Admin', 'admin');
    return newCert;
  }, [festSettings, certificates.length, currentUser, logAuditAction]);

  const bulkGenerateCertificates = useCallback((dataList: Array<Partial<Certificate> & { student_id: string; student_name: string; programme_id: string; programme_name: string; team: TeamId }>) => {
    const generated: Certificate[] = [];
    const prefix = festSettings.certificate_prefix || `ISA-AF-${festSettings.festYear || '2026'}-`;
    let currentCount = certificates.length;

    dataList.forEach(data => {
      currentCount++;
      const countPadded = currentCount.toString().padStart(4, '0');
      const certNum = data.certificate_number || `${prefix}${countPadded}`;
      const isAchievement = data.position && data.position > 0;
      const certType: Certificate['certificate_type'] = data.certificate_type || (isAchievement ? 'achievement' : 'participation');

      const cert: Certificate = {
        id: data.id || ('cert-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
        certificate_number: certNum,
        certificate_type: certType,
        title: data.title || (certType === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : certType === 'special_award' ? 'SPECIAL AWARD CERTIFICATE' : 'CERTIFICATE OF PARTICIPATION'),
        student_id: data.student_id,
        student_name: data.student_name,
        chest_number: data.chest_number || '',
        class_name: data.class_name || '',
        student_photo: data.student_photo || '',
        programme_id: data.programme_id,
        programme_code: data.programme_code || '',
        programme_name: data.programme_name,
        category: data.category || '',
        position: data.position ?? null,
        grade: data.grade || '',
        marks: data.marks,
        max_marks: data.max_marks || 100,
        special_award_name: data.special_award_name || '',
        team: data.team,
        team_name: data.team_name || (data.team ? data.team.toUpperCase() : ''),
        fest_name: data.fest_name || festSettings.festName,
        fest_motto: data.fest_motto || festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
        fest_logo: data.fest_logo || festSettings.festLogo || '/thanimiyyath-logo.svg',
        year: data.year || festSettings.festYear || '2026',
        date: data.date || festSettings.certificate_issue_date || new Date().toISOString().substring(0, 10),
        institution_name: data.institution_name || festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY',
        fest_controller_name: data.fest_controller_name || festSettings.fest_controller_name || 'IQBAL ASSHAFI',
        fest_controller_designation: data.fest_controller_designation || festSettings.fest_controller_designation || 'Fest Controller',
        fest_controller_signature: data.fest_controller_signature || festSettings.fest_controller_signature || '',
        vice_principal_name: data.vice_principal_name || festSettings.vice_principal_name || "RAFI ASH'ARY",
        vice_principal_designation: data.vice_principal_designation || festSettings.vice_principal_designation || 'Vice Principal',
        vice_principal_signature: data.vice_principal_signature || festSettings.vice_principal_signature || '',
        theme: data.theme || festSettings.certificate_theme || 'emerald',
        show_photo: data.show_photo ?? festSettings.certificate_show_photo ?? true,
        show_qr: data.show_qr ?? festSettings.certificate_show_qr ?? true,
        show_marks: data.show_marks ?? festSettings.certificate_show_marks ?? true,
        show_grade: data.show_grade ?? festSettings.certificate_show_grade ?? true,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        qr_verification_url: `/verify-certificate?number=${encodeURIComponent(certNum)}`
      };
      generated.push(cert);
    });

    setCertificates(prev => {
      const existingMap = new Map(prev.map(c => [c.student_id + '_' + c.programme_id, c]));
      generated.forEach(g => existingMap.set(g.student_id + '_' + g.programme_id, g));
      return Array.from(existingMap.values());
    });

    logAuditAction('Bulk Certificates Generated', `Issued ${generated.length} official certificates in bulk batch`, currentUser?.name || 'Admin', 'admin');
    return generated;
  }, [festSettings, certificates.length, currentUser, logAuditAction]);

  const revokeCertificate = useCallback((certId: string) => {
    setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'revoked' } : c));
    logAuditAction('Certificate Revoked', `Revoked certificate ID ${certId}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const restoreCertificate = useCallback((certId: string) => {
    setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'active' } : c));
    logAuditAction('Certificate Restored', `Restored certificate ID ${certId} to active valid status`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const deleteCertificate = useCallback((certId: string) => {
    setCertificates(prev => prev.filter(c => c.id !== certId));
    logAuditAction('Certificate Deleted', `Deleted certificate record ${certId}`, currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const verifyCertificateByNumber = useCallback((certNumber: string): Certificate | undefined => {
    if (!certNumber || !certNumber.trim()) return undefined;
    const clean = certNumber.trim().toUpperCase();
    return certificates.find(c => c.certificate_number.trim().toUpperCase() === clean);
  }, [certificates]);

  // STUDENT SEARCH / PUBLIC LOOKUP
  const searchStudent = useCallback((query: string): Student | null => {
    if (!query || !query.trim()) return null;
    const cleanQuery = query.trim().toLowerCase();
    return students.find(s => 
      s.chest_number.trim().toLowerCase() === cleanQuery ||
      s.student_id.trim().toLowerCase() === cleanQuery ||
      s.admission_number.trim().toLowerCase() === cleanQuery
    ) || null;
  }, [students]);

  const getStudentResults = useCallback((studentId: string, onlyPublished = true): Result[] => {
    return results.filter(r => {
      if (r.student_id !== studentId) return false;
      if (onlyPublished) {
        return r.status === 'published';
      }
      return true;
    });
  }, [results]);

  const resetToDemoData = useCallback(() => {
    setStudents(INITIAL_STUDENTS);
    setCategories(INITIAL_CATEGORIES);
    setProgrammes(INITIAL_PROGRAMMES);
    setParticipants(INITIAL_PARTICIPANTS);
    setJudges(INITIAL_JUDGES);
    setResults(INITIAL_RESULTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setFestSettings(INITIAL_FEST_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCertificates([]);
    setPosters(INITIAL_POSTERS);
    logAuditAction('System Reset', 'All database tables restored to factory demo state', currentUser?.name || 'Admin', 'admin');
  }, [currentUser, logAuditAction]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme,
    currentUser,
    loginAs,
    logout,
    teams,
    students,
    categories,
    programmes,
    participants,
    judges,
    results,
    announcements,
    festSettings,
    certificates,
    auditLogs,
    posters,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteMultipleStudents,
    deleteAllStudents,
    bulkImportStudents,
    addProgramme,
    updateProgramme,
    deleteProgramme,
    deleteMultipleProgrammes,
    deleteAllProgrammes,
    bulkImportProgrammes,
    addCategory,
    updateCategory,
    deleteCategory,
    assignParticipant,
    updateParticipantStatus,
    removeParticipant,
    addJudge,
    updateJudge,
    deleteJudge,
    assignJudgeToProgramme,
    saveResultDraft,
    submitJudgeResult,
    verifyResult,
    publishResult,
    unpublishResult,
    unlockResult,
    deleteResult,
    updateResultMarks,
    calculateAutoGradeAndPositions,
    generateResultPoster,
    regenerateResultPoster,
    publishResultPoster,
    archiveResultPoster,
    deleteResultPoster,
    getPosterForProgramme,
    addAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    updateFestSettings,
    generateCertificate,
    bulkGenerateCertificates,
    revokeCertificate,
    restoreCertificate,
    deleteCertificate,
    verifyCertificateByNumber,
    searchStudent,
    getStudentResults,
    resetToDemoData,
  };

  return <FestContext.Provider value={value}>{children}</FestContext.Provider>;
};

export const useFest = () => {
  const context = useContext(FestContext);
  if (!context) {
    throw new Error('useFest must be used within a FestProvider');
  }
  return context;
};
