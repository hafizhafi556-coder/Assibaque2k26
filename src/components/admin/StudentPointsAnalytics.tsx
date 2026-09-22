import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  RotateCcw, 
  Printer, 
  Eye, 
  User, 
  Sparkles, 
  Medal, 
  Award, 
  Users, 
  GraduationCap, 
  FolderTree, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { 
  useFest, 
  calculateTotalResultPoints, 
  isGroupOrTeamProgramme,
  normalizeCategory 
} from '../../context/FestContext';
import { Student, Result, Programme } from '../../types';

export type PointRangeGroup = 'all' | '1-15' | '16-30' | '31-50' | '50+' | '0';

export function getStudentCategoryName(student: Student): string {
  if (student.category && student.category.trim()) return student.category.trim();
  const cls = (student.class || '').toLowerCase();
  if (cls.includes('8')) return 'Sub Junior';
  if (cls.includes('9') || cls.includes('10')) return 'Junior';
  if (cls.includes('11') || cls.includes('12')) return 'Senior';
  if (cls.includes('degree') || cls.includes('ug') || cls.includes('pg')) return 'Super Senior';
  if (cls.includes('hifz') || cls.includes('hifdh')) return 'Hifz';
  return 'General';
}

export interface StudentAnalyticsRecord {
  student: Student;
  categoryName: string;
  totalPoints: number;
  totalMarks: number;
  pointRange: '1–15' | '16–30' | '31–50' | '50+' | 'No Points';
  pointRangeKey: PointRangeGroup;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  participatedCount: number;
  results: {
    result: Result;
    programme: Programme | undefined;
    positionPoints: number;
    gradePoints: number;
    awardedPoints: number;
  }[];
  rank: number;
}

export const StudentPointsAnalytics: React.FC = () => {
  const { 
    students, 
    results, 
    programmes, 
    teams, 
    categories, 
    festSettings 
  } = useFest();

  // Active Main Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'classes' | 'categories' | 'teams'>('individual');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPointRange, setSelectedPointRange] = useState<PointRangeGroup>('all');
  const [selectedProgramme, setSelectedProgramme] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [tieBreakMode, setTieBreakMode] = useState<'same_rank' | 'medals'>('medals');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selected Student for Detail Modal
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentAnalyticsRecord | null>(null);

  // Official Printable Report Modal State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [printLayoutDensity, setPrintLayoutDensity] = useState<'compact' | 'standard'>('compact');

  // 1. DYNAMICALLY EXTRACT UNIQUE CLASSES & CATEGORIES FROM DATABASE
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach(s => {
      if (s.class && s.class.trim()) {
        classSet.add(s.class.trim());
      }
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    categories.forEach(c => catSet.add(c.name));
    programmes.forEach(p => {
      if (p.category && p.category.trim()) catSet.add(p.category.trim());
    });
    students.forEach(s => {
      catSet.add(getStudentCategoryName(s));
    });
    return Array.from(catSet).filter(Boolean).sort();
  }, [categories, programmes, students]);

  // 2. COMPUTE INDIVIDUAL STUDENT ANALYTICS FROM PUBLISHED RESULTS ONLY
  const studentAnalyticsList = useMemo(() => {
    // Only published results count towards student points
    const publishedResults = results.filter(r => r.status === 'published');

    const list: StudentAnalyticsRecord[] = students.map(student => {
      const categoryName = getStudentCategoryName(student);

      // Find all published results for this student
      const studentResults = publishedResults.filter(r => 
        r.student_id === student.id || r.chest_number === student.chest_number
      );

      let totalPoints = 0;
      let totalMarks = 0;
      let firstCount = 0;
      let secondCount = 0;
      let thirdCount = 0;

      const detailedResults = studentResults.map(res => {
        const prg = programmes.find(p => p.id === res.programme_id);
        const breakdown = calculateTotalResultPoints(
          prg, 
          res.position, 
          res.grade, 
          festSettings.pointScheme
        );

        // Individual student points rule:
        // Individual & General Individual -> studentPoints
        // Group events points go to teams only
        const awardedPoints = breakdown.studentPoints;
        totalPoints += awardedPoints;
        totalMarks += (res.total_marks || 0);

        if (res.position === 1) firstCount += 1;
        if (res.position === 2) secondCount += 1;
        if (res.position === 3) thirdCount += 1;

        return {
          result: res,
          programme: prg,
          positionPoints: breakdown.positionPoints,
          gradePoints: breakdown.gradePoints,
          awardedPoints
        };
      });

      // Point Range Grouping logic strictly matching specifications:
      // points >= 1 && points <= 15 -> '1–15'
      // points >= 16 && points <= 30 -> '16–30'
      // points >= 31 && points <= 50 -> '31–50' (50 belongs to 31-50)
      // points >= 51 -> '50+'
      // points === 0 -> 'No Points'
      let pointRange: '1–15' | '16–30' | '31–50' | '50+' | 'No Points' = 'No Points';
      let pointRangeKey: PointRangeGroup = '0';

      if (totalPoints >= 51) {
        pointRange = '50+';
        pointRangeKey = '50+';
      } else if (totalPoints >= 31 && totalPoints <= 50) {
        pointRange = '31–50';
        pointRangeKey = '31-50';
      } else if (totalPoints >= 16 && totalPoints <= 30) {
        pointRange = '16–30';
        pointRangeKey = '16-30';
      } else if (totalPoints >= 1 && totalPoints <= 15) {
        pointRange = '1–15';
        pointRangeKey = '1-15';
      } else {
        pointRange = 'No Points';
        pointRangeKey = '0';
      }

      return {
        student,
        categoryName,
        totalPoints,
        totalMarks,
        pointRange,
        pointRangeKey,
        firstCount,
        secondCount,
        thirdCount,
        participatedCount: studentResults.length,
        results: detailedResults,
        rank: 0 // Assigned below
      };
    });

    // Sort students by Total Points DESC
    list.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (tieBreakMode === 'medals') {
        if (b.firstCount !== a.firstCount) return b.firstCount - a.firstCount;
        if (b.secondCount !== a.secondCount) return b.secondCount - a.secondCount;
        if (b.thirdCount !== a.thirdCount) return b.thirdCount - a.thirdCount;
        if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
      }
      return a.student.student_name.localeCompare(b.student.student_name);
    });

    // Assign Ranks
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        const prev = list[i - 1];
        const curr = list[i];
        if (tieBreakMode === 'same_rank' && curr.totalPoints === prev.totalPoints) {
          curr.rank = prev.rank;
        } else if (
          tieBreakMode === 'medals' && 
          curr.totalPoints === prev.totalPoints && 
          curr.firstCount === prev.firstCount &&
          curr.secondCount === prev.secondCount &&
          curr.thirdCount === prev.thirdCount
        ) {
          curr.rank = prev.rank;
        } else {
          curr.rank = i + 1;
        }
      } else {
        list[i].rank = 1;
      }
    }

    return list;
  }, [students, results, programmes, festSettings, tieBreakMode]);

  // 3. SUMMARY DASHBOARD STATS
  const summaryStats = useMemo(() => {
    const totalStudents = studentAnalyticsList.length;
    const withPoints = studentAnalyticsList.filter(s => s.totalPoints > 0).length;
    const zeroPoints = totalStudents - withPoints;
    const group1_15 = studentAnalyticsList.filter(s => s.pointRangeKey === '1-15').length;
    const group16_30 = studentAnalyticsList.filter(s => s.pointRangeKey === '16-30').length;
    const group31_50 = studentAnalyticsList.filter(s => s.pointRangeKey === '31-50').length;
    const group50Plus = studentAnalyticsList.filter(s => s.pointRangeKey === '50+').length;
    const totalAwardedIndividualPoints = studentAnalyticsList.reduce((acc, s) => acc + s.totalPoints, 0);

    return {
      totalStudents,
      withPoints,
      zeroPoints,
      group1_15,
      group16_30,
      group31_50,
      group50Plus,
      totalAwardedIndividualPoints
    };
  }, [studentAnalyticsList]);

  // 4. FILTERING WITH MULTI-CRITERIA AND SEARCH
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return studentAnalyticsList.filter(item => {
      const s = item.student;

      // Search Query: Name, Chest No, Student ID, Admission No
      if (query) {
        const nameMatch = s.student_name.toLowerCase().includes(query);
        const chestMatch = s.chest_number.toLowerCase().includes(query);
        const idMatch = (s.student_id || '').toLowerCase().includes(query);
        const admMatch = (s.admission_number || '').toLowerCase().includes(query);
        if (!nameMatch && !chestMatch && !idMatch && !admMatch) {
          return false;
        }
      }

      // Class Filter
      if (selectedClass !== 'all') {
        if ((s.class || '').trim() !== selectedClass) return false;
      }

      // Category Filter
      if (selectedCategory !== 'all') {
        const sCatNorm = normalizeCategory(item.categoryName);
        const fCatNorm = normalizeCategory(selectedCategory);
        if (sCatNorm !== fCatNorm && item.categoryName !== selectedCategory) return false;
      }

      // Team Filter
      if (selectedTeam !== 'all') {
        if (s.team?.toLowerCase() !== selectedTeam.toLowerCase()) return false;
      }

      // Point Range Filter
      if (selectedPointRange !== 'all') {
        if (item.pointRangeKey !== selectedPointRange) return false;
      }

      // Programme Filter
      if (selectedProgramme !== 'all') {
        const participatedInPrg = item.results.some(r => r.programme?.id === selectedProgramme);
        if (!participatedInPrg) return false;
      }

      // Gender Filter
      if (selectedGender !== 'all') {
        if ((s.gender || '').toLowerCase() !== selectedGender.toLowerCase()) return false;
      }

      // Position Filter
      if (selectedPosition !== 'all') {
        if (selectedPosition === '1st' && item.firstCount === 0) return false;
        if (selectedPosition === '2nd' && item.secondCount === 0) return false;
        if (selectedPosition === '3rd' && item.thirdCount === 0) return false;
        if (selectedPosition === 'podium' && (item.firstCount + item.secondCount + item.thirdCount === 0)) return false;
        if (selectedPosition === 'none' && (item.firstCount + item.secondCount + item.thirdCount > 0)) return false;
      }

      return true;
    });
  }, [
    studentAnalyticsList, 
    searchQuery, 
    selectedClass, 
    selectedCategory, 
    selectedTeam, 
    selectedPointRange, 
    selectedProgramme, 
    selectedGender, 
    selectedPosition
  ]);

  // 5. CLASS-WISE ANALYTICS COMPUTATION
  const classAnalytics = useMemo(() => {
    return availableClasses.map(cls => {
      const studentsInClass = studentAnalyticsList.filter(s => s.student.class?.trim() === cls);
      const totalStudents = studentsInClass.length;
      const participated = studentsInClass.filter(s => s.participatedCount > 0).length;
      const withPoints = studentsInClass.filter(s => s.totalPoints > 0).length;
      const totalPoints = studentsInClass.reduce((sum, s) => sum + s.totalPoints, 0);
      const avgPoints = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : '0';
      const highestPoints = studentsInClass.length > 0 ? Math.max(...studentsInClass.map(s => s.totalPoints)) : 0;
      const topStudent = studentsInClass.find(s => s.totalPoints === highestPoints && highestPoints > 0);

      return {
        className: cls,
        totalStudents,
        participated,
        withPoints,
        totalPoints,
        avgPoints,
        highestPoints,
        topStudent
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [availableClasses, studentAnalyticsList]);

  // 6. CATEGORY-WISE ANALYTICS COMPUTATION
  const categoryAnalytics = useMemo(() => {
    return availableCategories.map(cat => {
      const fCatNorm = normalizeCategory(cat);
      const studentsInCat = studentAnalyticsList.filter(s => {
        return normalizeCategory(s.categoryName) === fCatNorm || s.categoryName === cat;
      });
      const prgsInCat = programmes.filter(p => {
        return normalizeCategory(p.category) === fCatNorm || p.category === cat;
      });

      const totalStudents = studentsInCat.length;
      const withPoints = studentsInCat.filter(s => s.totalPoints > 0).length;
      const totalPoints = studentsInCat.reduce((sum, s) => sum + s.totalPoints, 0);
      const avgPoints = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : '0';
      const highestPoints = studentsInCat.length > 0 ? Math.max(...studentsInCat.map(s => s.totalPoints)) : 0;
      const topStudent = studentsInCat.find(s => s.totalPoints === highestPoints && highestPoints > 0);

      return {
        categoryName: cat,
        totalStudents,
        programmesCount: prgsInCat.length,
        withPoints,
        totalPoints,
        avgPoints,
        highestPoints,
        topStudent
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [availableCategories, studentAnalyticsList, programmes]);

  // 7. TEAM-WISE INDIVIDUAL ANALYTICS COMPUTATION
  const teamIndividualAnalytics = useMemo(() => {
    return teams.map(team => {
      const teamStudents = studentAnalyticsList.filter(s => s.student.team?.toLowerCase() === team.id.toLowerCase());
      const totalStudents = teamStudents.length;
      const withPoints = teamStudents.filter(s => s.totalPoints > 0).length;
      const totalIndividualPoints = teamStudents.reduce((sum, s) => sum + s.totalPoints, 0);
      const avgPoints = totalStudents > 0 ? (totalIndividualPoints / totalStudents).toFixed(1) : '0';
      const highestPoints = teamStudents.length > 0 ? Math.max(...teamStudents.map(s => s.totalPoints)) : 0;
      const topStudent = teamStudents.find(s => s.totalPoints === highestPoints && highestPoints > 0);

      const firstPositions = teamStudents.reduce((sum, s) => sum + s.firstCount, 0);
      const secondPositions = teamStudents.reduce((sum, s) => sum + s.secondCount, 0);
      const thirdPositions = teamStudents.reduce((sum, s) => sum + s.thirdCount, 0);

      return {
        team,
        totalStudents,
        withPoints,
        totalIndividualPoints,
        avgPoints,
        highestPoints,
        topStudent,
        firstPositions,
        secondPositions,
        thirdPositions
      };
    });
  }, [teams, studentAnalyticsList]);

  // 8. RESET ALL FILTERS
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedCategory('all');
    setSelectedTeam('all');
    setSelectedPointRange('all');
    setSelectedProgramme('all');
    setSelectedGender('all');
    setSelectedPosition('all');
    setCurrentPage(1);
  };

  // Active Filter Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedClass !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedTeam !== 'all') count++;
    if (selectedPointRange !== 'all') count++;
    if (selectedProgramme !== 'all') count++;
    if (selectedGender !== 'all') count++;
    if (selectedPosition !== 'all') count++;
    return count;
  }, [searchQuery, selectedClass, selectedCategory, selectedTeam, selectedPointRange, selectedProgramme, selectedGender, selectedPosition]);

  // 9. PAGINATION SLICE
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // 10. EXPORT TO CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Chest Number',
      'Student Name',
      'Student ID',
      'Admission No',
      'Class',
      'Category',
      'Team',
      'Programmes Participated',
      '1st Places',
      '2nd Places',
      '3rd Places',
      'Total Marks',
      'Total Individual Points',
      'Point Range'
    ];

    const rows = filteredStudents.map(item => [
      item.rank,
      `"${item.student.chest_number}"`,
      `"${item.student.student_name}"`,
      `"${item.student.student_id || ''}"`,
      `"${item.student.admission_number || ''}"`,
      `"${item.student.class || ''}"`,
      `"${item.categoryName}"`,
      `"${item.student.team || ''}"`,
      item.participatedCount,
      item.firstCount,
      item.secondCount,
      item.thirdCount,
      item.totalMarks,
      item.totalPoints,
      `"${item.pointRange}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_points_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 11. PRINT & REPORT EXPORT HANDLERS
  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  const handleTriggerPrint = () => {
    const reportElement = document.getElementById('student-points-printable-report');
    if (!reportElement) {
      window.print();
      return;
    }

    try {
      // Create hidden iframe for isolated clean printing without browser UI interference
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imam Shafi Fest 2026 - Student Points Tabulation Report</title>
            <style>
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 10px; color: #000; background: #fff; margin: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
              th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; }
              th { background: #f1f5f9; font-weight: 800; text-transform: uppercase; font-size: 9px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .font-black { font-weight: 900; }
              .font-mono { font-family: monospace; }
              .header-title { font-size: 16px; font-weight: 900; text-align: center; text-transform: uppercase; margin-bottom: 2px; }
              .header-sub { font-size: 11px; text-align: center; color: #475569; margin-bottom: 12px; }
              .meta-box { display: flex; justify-content: space-between; font-size: 10px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; }
              .badge { display: inline-block; padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: 800; border: 1px solid #cbd5e1; }
              .signatures { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; }
              .watermark { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; }
            </style>
          </head>
          <body>
            ${reportElement.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          window.print();
        }
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            // Ignore removal errors
          }
        }, 3000);
      }, 300);
    } catch (e) {
      window.print();
    }
  };

  const handleDownloadHtmlReport = () => {
    const reportElement = document.getElementById('student-points-printable-report');
    if (!reportElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Student Points Tabulation Report - Imam Shafi Fest 2026</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; background: #ffffff; max-width: 1200px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left; }
    th { background: #f8fafc; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #334155; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-mono { font-family: monospace; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; border: 1px solid #cbd5e1; background: #f1f5f9; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 11px; }
  </style>
</head>
<body>
  ${reportElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_points_report_${festSettings.festYear || 2026}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helpers for styling Point Range badges
  const getPointRangeBadgeStyle = (range: string) => {
    switch (range) {
      case '50+':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-black';
      case '31–50':
        return 'bg-sky-100 text-sky-950 border-sky-300 font-black';
      case '16–30':
        return 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold';
      case '1–15':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-200 font-medium';
    }
  };

  const getTeamColorStyle = (teamId?: string) => {
    switch ((teamId || '').toLowerCase()) {
      case 'nayro':
        return 'bg-sky-50 text-sky-950 border-sky-300';
      case 'zayro':
        return 'bg-amber-50 text-amber-950 border-amber-300';
      case 'lucero':
        return 'bg-purple-50 text-purple-950 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Trophy size={20} />
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
                Individual Student Points & Performance
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Admin Analytics
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Official admin module for individual student standings, strict point ranges (1–15, 16–30, 31–50, 50+), and class/category analytics.
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-300 cursor-pointer shadow-2xs touch-target"
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet size={14} className="text-emerald-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenPrintPreview}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer touch-target active:scale-95"
            title="Open official printable tabulation sheet & PDF view"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY STATS CARDS (Point Range Groups) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Students */}
        <div 
          onClick={() => { setSelectedPointRange('all'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              Total
            </span>
            <Users size={14} className={selectedPointRange === 'all' ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-600'} />
          </div>
          <div className={`text-2xl font-black font-heading font-mono ${selectedPointRange === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {summaryStats.totalStudents}
          </div>
          <span className={`text-[10px] font-semibold block mt-0.5 ${selectedPointRange === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Contestants
          </span>
        </div>

        {/* 1-15 Points */}
        <div 
          onClick={() => { setSelectedPointRange('1-15'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === '1-15' 
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === '1-15' ? 'text-slate-950' : 'text-slate-600'}`}>
              1–15 Pts
            </span>
            <Award size={14} className={selectedPointRange === '1-15' ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-600'} />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-slate-900">
            {summaryStats.group1_15}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 block mt-0.5">
            Students
          </span>
        </div>

        {/* 16-30 Points */}
        <div 
          onClick={() => { setSelectedPointRange('16-30'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === '16-30' 
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === '16-30' ? 'text-slate-950' : 'text-indigo-700'}`}>
              16–30 Pts
            </span>
            <Medal size={14} className={selectedPointRange === '16-30' ? 'text-slate-950' : 'text-indigo-500 group-hover:text-amber-600'} />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-slate-900">
            {summaryStats.group16_30}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 block mt-0.5">
            Students
          </span>
        </div>

        {/* 31-50 Points */}
        <div 
          onClick={() => { setSelectedPointRange('31-50'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === '31-50' 
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === '31-50' ? 'text-slate-950' : 'text-sky-700'}`}>
              31–50 Pts
            </span>
            <Sparkles size={14} className={selectedPointRange === '31-50' ? 'text-slate-950' : 'text-sky-500 group-hover:text-amber-600'} />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-slate-900">
            {summaryStats.group31_50}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 block mt-0.5">
            Students
          </span>
        </div>

        {/* 50+ Points */}
        <div 
          onClick={() => { setSelectedPointRange('50+'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === '50+' 
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === '50+' ? 'text-slate-950' : 'text-amber-800'}`}>
              50+ Pts
            </span>
            <Trophy size={14} className={selectedPointRange === '50+' ? 'text-slate-950' : 'text-amber-600 group-hover:text-amber-700'} />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-amber-800">
            {summaryStats.group50Plus}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 block mt-0.5">
            Top Scorers
          </span>
        </div>

        {/* Scored Points (>0) */}
        <div 
          onClick={() => { setSelectedPointRange('all'); setActiveSubTab('individual'); }}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Scored Pts
            </span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-emerald-700">
            {summaryStats.withPoints}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
            {summaryStats.totalStudents > 0 ? `${Math.round((summaryStats.withPoints / summaryStats.totalStudents) * 100)}% active` : '0%'}
          </span>
        </div>

        {/* 0 Points */}
        <div 
          onClick={() => { setSelectedPointRange('0'); setActiveSubTab('individual'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            selectedPointRange === '0' 
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black' 
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPointRange === '0' ? 'text-slate-950' : 'text-slate-500'}`}>
              0 Points
            </span>
            <User size={14} className={selectedPointRange === '0' ? 'text-slate-950' : 'text-slate-400'} />
          </div>
          <div className="text-2xl font-black font-heading font-mono text-slate-700">
            {summaryStats.zeroPoints}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
            No Score Yet
          </span>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION (Individual / Class / Category / Team) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('individual')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'individual'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Trophy size={14} />
          <span>Individual Student Standings ({filteredStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('classes')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'classes'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap size={14} />
          <span>Class-Wise Performance ({availableClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'categories'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FolderTree size={14} />
          <span>Category Breakdown ({availableCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('teams')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'teams'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Team Individual Analytics ({teams.length})</span>
        </button>
      </div>

      {/* 4. MAIN INDIVIDUAL STANDINGS VIEW */}
      {activeSubTab === 'individual' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Box */}
              <div className="relative lg:col-span-2">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search student name, chest #, ID, admission #..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Point Range Dropdown */}
              <div>
                <select
                  value={selectedPointRange}
                  onChange={e => { setSelectedPointRange(e.target.value as PointRangeGroup); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Point Ranges</option>
                  <option value="1-15">1–15 Points (Group 1)</option>
                  <option value="16-30">16–30 Points (Group 2)</option>
                  <option value="31-50">31–50 Points (Group 3)</option>
                  <option value="50+">50+ Points (Group 4: 51+)</option>
                  <option value="0">0 Points (No Score)</option>
                </select>
              </div>

              {/* Class Dropdown */}
              <div>
                <select
                  value={selectedClass}
                  onChange={e => { setSelectedClass(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Classes ({availableClasses.length})</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              {/* Team Dropdown */}
              <div>
                <select
                  value={selectedTeam}
                  onChange={e => { setSelectedTeam(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>TEAM {t.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 items-center">
              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Programme Filter */}
              <div>
                <select
                  value={selectedProgramme}
                  onChange={e => { setSelectedProgramme(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="all">All Programmes</option>
                  {programmes.map(p => (
                    <option key={p.id} value={p.id}>{p.programme_code}: {p.programme_name}</option>
                  ))}
                </select>
              </div>

              {/* Position Filter */}
              <div>
                <select
                  value={selectedPosition}
                  onChange={e => { setSelectedPosition(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="all">All Positions</option>
                  <option value="1st">🥇 Won 1st Place</option>
                  <option value="2nd">🥈 Won 2nd Place</option>
                  <option value="3rd">🥉 Won 3rd Place</option>
                  <option value="podium">Any Podium (1st/2nd/3rd)</option>
                  <option value="none">No Podium Position</option>
                </select>
              </div>

              {/* Tie-Breaking Setting */}
              <div>
                <select
                  value={tieBreakMode}
                  onChange={e => setTieBreakMode(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                  title="Ranking Tie-break scheme"
                >
                  <option value="medals">Tie-Break: 1st/2nd Medals</option>
                  <option value="same_rank">Tie-Break: Equal Rank</option>
                </select>
              </div>

              {/* Page Size Selector */}
              <div>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold focus:outline-none"
                >
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={activeFiltersCount === 0}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    activeFiltersCount > 0
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW (Desktop & Tablet) */}
          <div className="hidden sm:block overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-14">Rank</th>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-3 py-3.5">Class & Cat</th>
                  <th className="px-3 py-3.5">Team</th>
                  <th className="px-3 py-3.5 text-center">Events</th>
                  <th className="px-3 py-3.5 text-center">🥇 1st</th>
                  <th className="px-3 py-3.5 text-center">🥈 2nd</th>
                  <th className="px-3 py-3.5 text-center">🥉 3rd</th>
                  <th className="px-3 py-3.5 text-center">Marks</th>
                  <th className="px-4 py-3.5 text-center">Total Points</th>
                  <th className="px-3 py-3.5 text-center">Point Range</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-12 text-center text-slate-500">
                      <Trophy size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No students found matching your selected filters.</p>
                      <button 
                        onClick={handleResetFilters}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(item => {
                    const s = item.student;

                    return (
                      <tr 
                        key={s.id} 
                        className={`hover:bg-slate-50/90 transition group ${
                          item.rank === 1 && item.totalPoints > 0 ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono font-black text-xs ${
                            item.rank === 1 && item.totalPoints > 0 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                            item.rank === 2 && item.totalPoints > 0 ? 'bg-slate-200 text-slate-800' :
                            item.rank === 3 && item.totalPoints > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            'text-slate-600 font-bold'
                          }`}>
                            {item.rank}
                          </span>
                        </td>

                        {/* Student Details & Photo */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center font-mono font-black text-slate-600 text-xs shadow-2xs">
                              {s.photo_url ? (
                                <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                `#${s.chest_number}`
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-heading font-black text-slate-900 text-xs truncate">
                                {s.student_name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                <span className="font-bold text-amber-900 bg-amber-50 px-1 rounded border border-amber-200">
                                  Chest #{s.chest_number}
                                </span>
                                {s.student_id && <span>ID: {s.student_id}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Class & Category */}
                        <td className="px-3 py-3.5">
                          <div className="font-bold text-slate-900 text-xs">
                            Class {s.class || '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {item.categoryName}
                          </div>
                        </td>

                        {/* Team */}
                        <td className="px-3 py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getTeamColorStyle(s.team)}`}>
                            {s.team || '-'}
                          </span>
                        </td>

                        {/* Events Participated */}
                        <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-700">
                          {item.participatedCount}
                        </td>

                        {/* 1st Positions */}
                        <td className="px-3 py-3.5 text-center font-mono font-black text-amber-800">
                          {item.firstCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                              {item.firstCount}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 2nd Positions */}
                        <td className="px-3 py-3.5 text-center font-mono font-black text-slate-700">
                          {item.secondCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {item.secondCount}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 3rd Positions */}
                        <td className="px-3 py-3.5 text-center font-mono font-black text-amber-950">
                          {item.thirdCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300">
                              {item.thirdCount}
                            </span>
                          ) : '-'}
                        </td>

                        {/* Total Marks */}
                        <td className="px-3 py-3.5 text-center font-mono font-semibold text-slate-600">
                          {item.totalMarks}
                        </td>

                        {/* Total Individual Points */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="text-base font-black font-mono text-slate-950">
                            {item.totalPoints} <span className="text-[10px] text-slate-500 font-bold">PTS</span>
                          </div>
                        </td>

                        {/* Point Range */}
                        <td className="px-3 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] border ${getPointRangeBadgeStyle(item.pointRange)}`}>
                            {item.pointRange}
                          </span>
                        </td>

                        {/* Action: Detail Modal */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedStudentForModal(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-400 hover:text-slate-950 text-slate-800 text-[11px] font-bold transition cursor-pointer shadow-2xs group-hover:border-amber-300"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (Under sm breakpoint) */}
          <div className="sm:hidden space-y-3">
            {paginatedStudents.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-slate-200">
                <p className="text-xs font-bold text-slate-600">No students match current filters.</p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-2 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              paginatedStudents.map(item => {
                const s = item.student;
                return (
                  <div 
                    key={s.id}
                    className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden flex items-center justify-center font-mono font-black text-amber-900 text-xs">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `#${s.chest_number}`
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              #{s.chest_number}
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase border ${getTeamColorStyle(s.team)}`}>
                              {s.team}
                            </span>
                          </div>
                          <h4 className="font-heading font-black text-sm text-slate-900 mt-0.5">{s.student_name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">Class {s.class || '-'} • {item.categoryName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono font-black text-xs">
                          Rank #{item.rank}
                        </span>
                        <div className="text-lg font-black font-mono text-slate-950 mt-1">
                          {item.totalPoints} <span className="text-[10px] text-slate-500">PTS</span>
                        </div>
                      </div>
                    </div>

                    {/* Positions & Point Range Badge */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                        <span>🥇 {item.firstCount}</span>
                        <span>🥈 {item.secondCount}</span>
                        <span>🥉 {item.thirdCount}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] border ${getPointRangeBadgeStyle(item.pointRange)}`}>
                        {item.pointRange}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedStudentForModal(item)}
                      className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Eye size={13} />
                      <span>View Performance Breakdown</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600">
              <div>
                Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> students
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-200">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. CLASS-WISE PERFORMANCE ANALYTICS VIEW */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-heading font-black text-base text-slate-900 mb-1">
              Class-Wise Points & Participation Analytics
            </h3>
            <p className="text-xs text-slate-600">
              Comparative point aggregation, participation density, and top-performing student across all classes.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5 text-center">Total Students</th>
                  <th className="px-4 py-3.5 text-center">Participated</th>
                  <th className="px-4 py-3.5 text-center">With Points</th>
                  <th className="px-4 py-3.5 text-center">Total Points</th>
                  <th className="px-4 py-3.5 text-center">Average Pts / Student</th>
                  <th className="px-4 py-3.5">Highest Individual Scorer</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classAnalytics.map(row => (
                  <tr key={row.className} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-heading font-black text-sm text-slate-900">
                        Class {row.className}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                      {row.totalStudents}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                      {row.participated}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-700">
                      {row.withPoints}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-base text-slate-900">
                      {row.totalPoints} <span className="text-[10px] text-slate-500">PTS</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-800">
                      {row.avgPoints} pts
                    </td>
                    <td className="px-4 py-3.5">
                      {row.topStudent ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {row.topStudent.student.student_name}
                          </span>
                          <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-950 font-mono font-black text-[10px] border border-amber-300">
                            {row.topStudent.totalPoints} PTS
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedClass(row.className);
                          setActiveSubTab('individual');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] transition shadow-xs cursor-pointer"
                      >
                        View Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CATEGORY-WISE ANALYTICS VIEW */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-heading font-black text-base text-slate-900 mb-1">
              Category-Wise Performance Distribution
            </h3>
            <p className="text-xs text-slate-600">
              Aggregated individual points across festival categories (Sub Junior, Junior, Senior, Super Senior, General, Hifz).
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Students</th>
                  <th className="px-4 py-3.5 text-center">Programmes</th>
                  <th className="px-4 py-3.5 text-center">Scored Points</th>
                  <th className="px-4 py-3.5 text-center">Total Points</th>
                  <th className="px-4 py-3.5 text-center">Average Points</th>
                  <th className="px-4 py-3.5">Top Category Scorer</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryAnalytics.map(row => (
                  <tr key={row.categoryName} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-heading font-black text-sm text-slate-900">
                        {row.categoryName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                      {row.totalStudents}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                      {row.programmesCount}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-700">
                      {row.withPoints}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-base text-slate-900">
                      {row.totalPoints} <span className="text-[10px] text-slate-500">PTS</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-800">
                      {row.avgPoints} pts
                    </td>
                    <td className="px-4 py-3.5">
                      {row.topStudent ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {row.topStudent.student.student_name}
                          </span>
                          <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-950 font-mono font-black text-[10px] border border-amber-300">
                            {row.topStudent.totalPoints} PTS
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCategory(row.categoryName);
                          setActiveSubTab('individual');
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] transition shadow-xs cursor-pointer"
                      >
                        View Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TEAM-WISE INDIVIDUAL ANALYTICS VIEW */}
      {activeSubTab === 'teams' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-heading font-black text-base text-slate-900 mb-1">
              Team-Wise Individual Student Performance
            </h3>
            <p className="text-xs text-slate-600">
              Analysis of individual student contributors per team (Nayro, Zayro, Lucero). Note: this analyzes individual student scores, distinct from total group team scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teamIndividualAnalytics.map(item => (
              <div 
                key={item.team.id}
                className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                  item.team.id === 'nayro' ? 'bg-sky-50/40 border-sky-200' :
                  item.team.id === 'zayro' ? 'bg-amber-50/40 border-amber-200' :
                  'bg-purple-50/40 border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-base shadow-xs">
                      {item.team.id === 'nayro' ? '🌊' : item.team.id === 'zayro' ? '⚡' : '✨'}
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base text-slate-900">
                        TEAM {item.team.name.toUpperCase()}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {item.totalStudents} Registered Contestants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Individual Metrics */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Ind. Points</span>
                    <strong className="text-lg font-black font-mono text-slate-900">{item.totalIndividualPoints} PTS</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Average / Student</span>
                    <strong className="text-lg font-black font-mono text-amber-800">{item.avgPoints} PTS</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Scorers</span>
                    <strong className="text-base font-black font-mono text-emerald-700">{item.withPoints} / {item.totalStudents}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Highest Score</span>
                    <strong className="text-base font-black font-mono text-slate-900">{item.highestPoints} PTS</strong>
                  </div>
                </div>

                {/* Medals Won by Team Individuals */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-around font-mono font-black text-xs text-slate-800">
                  <span>🥇 {item.firstPositions} Gold</span>
                  <span>🥈 {item.secondPositions} Silver</span>
                  <span>🥉 {item.thirdPositions} Bronze</span>
                </div>

                {/* Top Performer */}
                {item.topStudent && (
                  <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 block">Top Individual Performer:</span>
                    <div className="flex items-center justify-between mt-1">
                      <strong className="text-slate-900 font-bold">{item.topStudent.student.student_name}</strong>
                      <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-950 font-black font-mono text-[11px]">
                        {item.topStudent.totalPoints} PTS
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedTeam(item.team.id);
                    setActiveSubTab('individual');
                    setCurrentPage(1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs transition cursor-pointer shadow-xs"
                >
                  Filter Roster to Team {item.team.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. STUDENT PERFORMANCE DETAIL MODAL */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-amber-100 border-2 border-amber-300 shrink-0 flex items-center justify-center font-mono font-black text-amber-900 text-base shadow-xs">
                  {selectedStudentForModal.student.photo_url ? (
                    <img src={selectedStudentForModal.student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `#${selectedStudentForModal.student.chest_number}`
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                      Chest #{selectedStudentForModal.student.chest_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getTeamColorStyle(selectedStudentForModal.student.team)}`}>
                      {selectedStudentForModal.student.team}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] border ${getPointRangeBadgeStyle(selectedStudentForModal.pointRange)}`}>
                      {selectedStudentForModal.pointRange}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900">
                    {selectedStudentForModal.student.student_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Class {selectedStudentForModal.student.class || '-'} • Category: {selectedStudentForModal.categoryName}
                    {selectedStudentForModal.student.student_id ? ` • ID: ${selectedStudentForModal.student.student_id}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body & Performance Highlights */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Highlight Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Total Points</span>
                  <div className="text-2xl font-black font-mono text-slate-950 mt-0.5">
                    {selectedStudentForModal.totalPoints} <span className="text-xs font-bold text-amber-800">PTS</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Overall Rank</span>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                    #{selectedStudentForModal.rank}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Events Evaluated</span>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                    {selectedStudentForModal.participatedCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Podiums Won</span>
                  <div className="text-sm font-mono font-black text-slate-800 mt-1 flex items-center gap-1.5">
                    <span>🥇{selectedStudentForModal.firstCount}</span>
                    <span>🥈{selectedStudentForModal.secondCount}</span>
                    <span>🥉{selectedStudentForModal.thirdCount}</span>
                  </div>
                </div>
              </div>

              {/* Point Breakdown & History Table */}
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900 mb-2.5 flex items-center gap-2">
                  <Trophy size={15} className="text-amber-600" />
                  <span>Individual Point Breakdown History</span>
                </h4>

                {selectedStudentForModal.results.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    No published evaluation results recorded for this student yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs text-slate-800">
                      <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-black border-b border-slate-200">
                        <tr>
                          <th className="px-3.5 py-2.5">Event</th>
                          <th className="px-3 py-2.5 text-center">Type</th>
                          <th className="px-3 py-2.5 text-center">Marks</th>
                          <th className="px-3 py-2.5 text-center">Grade</th>
                          <th className="px-3 py-2.5 text-center">Position</th>
                          <th className="px-3.5 py-2.5 text-right">Awarded Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudentForModal.results.map(({ result, programme, positionPoints, gradePoints, awardedPoints }) => {
                          const isGroup = isGroupOrTeamProgramme(programme);
                          return (
                            <tr key={result.id} className="hover:bg-slate-50/80">
                              <td className="px-3.5 py-3">
                                <span className="font-mono text-[10px] font-black text-amber-800 block">
                                  {programme?.programme_code}
                                </span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {programme?.programme_name || 'Event'}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {programme?.category} • {programme?.venue}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  isGroup
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                  {isGroup ? 'Group (Team Only)' : 'Individual'}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                                {result.total_marks || '-'}
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-black text-slate-800 border border-slate-200 text-[10px]">
                                  {result.grade || '-'}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-center">
                                {result.position === 1 ? (
                                  <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">🥇 1st Place</span>
                                ) : result.position === 2 ? (
                                  <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">🥈 2nd Place</span>
                                ) : result.position === 3 ? (
                                  <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-[11px]">🥉 3rd Place</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Participant</span>
                                )}
                              </td>

                              <td className="px-3.5 py-3 text-right">
                                <div className="font-mono font-black text-sm text-slate-950">
                                  +{awardedPoints} <span className="text-[10px] text-slate-500">PTS</span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono block">
                                  Pos: {positionPoints} + Gr: {gradePoints}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Points calculated strictly from verified & published results.
              </div>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs cursor-pointer shadow-xs transition"
              >
                Close Performance Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. OFFICIAL PRINT & PDF TABULATION SHEET MODAL */}
      {isPrintPreviewOpen && (
        <div className="student-points-print-modal-overlay fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          {/* Top Sticky Toolbar (Hidden on actual print) */}
          <div className="no-print sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-md">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white">
                <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
                  <Printer size={16} />
                </span>
                <div>
                  <h3 className="font-heading font-black text-sm text-white">
                    Official Student Points Tabulation Sheet
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Showing {filteredStudents.length} contestants • Print preview & export
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs mr-2">
                  <button
                    onClick={() => setPrintLayoutDensity('compact')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      printLayoutDensity === 'compact' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Compact (More Rows)
                  </button>
                  <button
                    onClick={() => setPrintLayoutDensity('standard')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      printLayoutDensity === 'standard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Standard
                  </button>
                </div>

                <button
                  onClick={handleDownloadHtmlReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                  title="Download offline HTML document"
                >
                  <Download size={13} className="text-sky-400" />
                  <span className="hidden sm:inline">Save HTML</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                  title="Download CSV"
                >
                  <FileSpreadsheet size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={handleTriggerPrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer touch-target active:scale-95"
                  title="Print / Save PDF via browser dialog"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer ml-1"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Printable Document Paper Viewport */}
          <div className="p-3 sm:p-6 flex-1 flex justify-center">
            <div 
              id="student-points-printable-report"
              className="student-points-printable-sheet w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 my-2"
            >
              {/* Document Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-left font-mono text-[10px] text-slate-500">
                    <span>REF: ISIA-AF26-STU-PTS</span>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-500">
                    <span>DATE: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl border border-amber-500 shadow-xs">
                    🏆
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black font-heading tracking-wide uppercase text-slate-950">
                      {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                    </h1>
                    <h2 className="text-xs sm:text-sm font-bold text-amber-900 tracking-wider uppercase">
                      {festSettings.festName || 'ANNUAL STATE ARTS FESTIVAL'} {festSettings.festYear || '2026'}
                    </h2>
                  </div>
                </div>

                <div className="mt-2 py-1 px-4 bg-slate-100 rounded-lg inline-block border border-slate-300">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">
                    OFFICIAL TABULATION SHEET - INDIVIDUAL STUDENT POINTS & RANKINGS
                  </h3>
                </div>

                {/* Filter Scope Banner */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-600 font-semibold">
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Class: <strong>{selectedClass === 'all' ? 'All Classes' : selectedClass}</strong></span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Category: <strong>{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</strong></span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Team: <strong>{selectedTeam === 'all' ? 'All Teams' : selectedTeam.toUpperCase()}</strong></span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Point Range: <strong>{selectedPointRange === 'all' ? 'All Ranges' : selectedPointRange}</strong></span>
                  <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-amber-950 font-bold">Total Contestants: <strong>{filteredStudents.length}</strong></span>
                </div>
              </div>

              {/* Summary Metrics Row */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Total Contestants</span>
                  <strong className="font-mono text-sm">{summaryStats.totalStudents}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">1–15 Pts</span>
                  <strong className="font-mono text-sm">{summaryStats.group1_15}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">16–30 Pts</span>
                  <strong className="font-mono text-sm">{summaryStats.group16_30}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">31–50 Pts</span>
                  <strong className="font-mono text-sm">{summaryStats.group31_50}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">50+ Pts (51+)</span>
                  <strong className="font-mono text-sm text-amber-800">{summaryStats.group50Plus}</strong>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-xs">
                  <span className="text-[9px] text-amber-900 uppercase font-bold block">Total Ind. Points</span>
                  <strong className="font-mono text-sm text-slate-950">{summaryStats.totalAwardedIndividualPoints} PTS</strong>
                </div>
              </div>

              {/* Tabulation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px] border-b-2 border-slate-300">
                    <tr>
                      <th className="px-2.5 py-2 text-center border border-slate-300 w-10">Rank</th>
                      <th className="px-2.5 py-2 text-center border border-slate-300 w-16">Chest #</th>
                      <th className="px-3 py-2 border border-slate-300">Student Name</th>
                      <th className="px-2 py-2 border border-slate-300 text-center w-16">Class</th>
                      <th className="px-2 py-2 border border-slate-300">Category</th>
                      <th className="px-2 py-2 border border-slate-300 text-center w-16">Team</th>
                      <th className="px-2 py-2 border border-slate-300 text-center w-12">Events</th>
                      <th className="px-1.5 py-2 border border-slate-300 text-center w-10">🥇1st</th>
                      <th className="px-1.5 py-2 border border-slate-300 text-center w-10">🥈2nd</th>
                      <th className="px-1.5 py-2 border border-slate-300 text-center w-10">🥉3rd</th>
                      <th className="px-2 py-2 border border-slate-300 text-center w-14">Marks</th>
                      <th className="px-2.5 py-2 border border-slate-300 text-center w-20 font-black">Points</th>
                      <th className="px-2 py-2 border border-slate-300 text-center w-20">Bracket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((item, idx) => (
                      <tr 
                        key={item.student.id} 
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      >
                        <td className="px-2 py-1.5 text-center font-mono font-bold border border-slate-300">
                          {item.rank}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono font-black text-amber-900 border border-slate-300">
                          #{item.student.chest_number}
                        </td>
                        <td className="px-3 py-1.5 font-bold text-slate-900 border border-slate-300">
                          {item.student.student_name}
                          {item.student.student_id && (
                            <span className="text-[9px] text-slate-500 font-mono block">ID: {item.student.student_id}</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center font-semibold border border-slate-300">
                          {item.student.class || '-'}
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-slate-700 border border-slate-300">
                          {item.categoryName}
                        </td>
                        <td className="px-2 py-1.5 text-center font-black uppercase text-[10px] border border-slate-300">
                          {item.student.team || '-'}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono text-slate-700 border border-slate-300">
                          {item.participatedCount}
                        </td>
                        <td className="px-1.5 py-1.5 text-center font-mono font-bold text-amber-800 border border-slate-300">
                          {item.firstCount || '-'}
                        </td>
                        <td className="px-1.5 py-1.5 text-center font-mono font-bold text-slate-600 border border-slate-300">
                          {item.secondCount || '-'}
                        </td>
                        <td className="px-1.5 py-1.5 text-center font-mono font-bold text-amber-950 border border-slate-300">
                          {item.thirdCount || '-'}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono text-slate-600 border border-slate-300">
                          {item.totalMarks}
                        </td>
                        <td className="px-2.5 py-1.5 text-center font-mono font-black text-slate-950 bg-amber-50/40 border border-slate-300">
                          {item.totalPoints}
                        </td>
                        <td className="px-2 py-1.5 text-center font-bold text-[10px] border border-slate-300">
                          {item.pointRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Signatures & Verification Area */}
              <div className="mt-10 pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-10 mb-2 border-b border-dashed border-slate-400"></div>
                  <strong className="block text-slate-900 uppercase font-black text-[11px]">General Convener</strong>
                  <span className="text-[10px] text-slate-500">Arts Fest Committee</span>
                </div>
                <div>
                  <div className="h-10 mb-2 border-b border-dashed border-slate-400"></div>
                  <strong className="block text-slate-900 uppercase font-black text-[11px]">Tabulation Head</strong>
                  <span className="text-[10px] text-slate-500">Scoring & Verification</span>
                </div>
                <div>
                  <div className="h-10 mb-2 border-b border-dashed border-slate-400"></div>
                  <strong className="block text-slate-900 uppercase font-black text-[11px]">Principal / Controller</strong>
                  <span className="text-[10px] text-slate-500">Imam Shafi Islamic Academy</span>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                Imam Shafi Islamic Academy • Official Fest Management System • Generated on {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
