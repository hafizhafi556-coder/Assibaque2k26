import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  Award, 
  AlertCircle, 
  User, 
  BookOpen,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFest, calculateTotalResultPoints, getProgrammeCriteriaType, formatParticipantDisplayName, isGroupOrTeamProgramme } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { CertificatePreviewModal } from '../certificate/CertificatePreviewModal';
import { ResultPosterModal } from '../common/ResultPosterModal';
import { Certificate, CertificateType, Student, Result, TeamId } from '../../types';

export const StudentResultSearch: React.FC = () => {
  const { 
    language, 
    searchStudent, 
    getStudentResults, 
    programmes, 
    festSettings,
    generateCertificate 
  } = useFest();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterProgrammeId, setPosterProgrammeId] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const student = searchStudent(searchQuery.trim());
    setSearchedStudent(student);
    setHasSearched(true);
  };

  const handleQuickLookup = (identifier: string) => {
    setSearchQuery(identifier);
    const student = searchStudent(identifier);
    setSearchedStudent(student);
    setHasSearched(true);
  };

  const studentResults = searchedStudent ? getStudentResults(searchedStudent.id, true) : [];

  // Calculate total points earned by this student from published results (Individual & General Individual only)
  const totalPointsEarned = studentResults.reduce((sum, r) => {
    const prg = programmes.find(p => p.id === r.programme_id);
    const breakdown = calculateTotalResultPoints(prg, r.position, r.grade, festSettings.pointScheme);
    return sum + breakdown.studentPoints;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleViewCertificate = (res: Result) => {
    if (!searchedStudent) return;
    const prg = programmes.find(p => p.id === res.programme_id);
    const isWinner = res.position && res.position >= 1 && res.position <= 3;
    const certType: CertificateType = isWinner ? 'achievement' : 'participation';

    // Create or retrieve certificate
    const cert = generateCertificate({
      student_id: searchedStudent.student_id,
      student_name: formatParticipantDisplayName(searchedStudent.student_name, prg) || searchedStudent.student_name,
      chest_number: searchedStudent.chest_number,
      class_name: searchedStudent.class ? `${searchedStudent.class} ${searchedStudent.division || ''}`.trim() : '',
      student_photo: searchedStudent.photo_url || '',
      programme_id: res.programme_id,
      programme_code: prg?.programme_code || '',
      programme_name: prg?.programme_name || 'Fest Programme',
      category: prg?.category || '',
      position: res.position as (1 | 2 | 3 | null),
      grade: res.grade,
      marks: res.total_marks,
      max_marks: 100,
      team: res.team,
      team_name: res.team.toUpperCase(),
      certificate_type: certType,
      title: certType === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION',
      fest_name: festSettings.festName,
      fest_motto: festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
      fest_logo: festSettings.festLogo,
      year: festSettings.festYear,
      date: festSettings.certificate_issue_date || '2026-09-25',
      institution_name: festSettings.institutionName,
      fest_controller_name: festSettings.fest_controller_name || 'IQBAL ASSHAFI',
      fest_controller_designation: festSettings.fest_controller_designation || 'Fest Controller',
      fest_controller_signature: festSettings.fest_controller_signature,
      vice_principal_name: festSettings.vice_principal_name || "RAFI ASH'ARY",
      vice_principal_designation: festSettings.vice_principal_designation || 'Vice Principal',
      vice_principal_signature: festSettings.vice_principal_signature,
      theme: festSettings.certificate_theme || 'emerald',
      show_photo: festSettings.certificate_show_photo ?? true,
      show_qr: festSettings.certificate_show_qr ?? true,
      show_marks: festSettings.certificate_show_marks ?? true,
      show_grade: festSettings.certificate_show_grade ?? true,
    });

    setActiveCertificate(cert);
  };

  const getTeamBadge = (team: TeamId) => {
    if (team === 'nayro') {
      return { label: 'NAYRO', color: 'bg-sky-100 text-sky-900 border-sky-300', logo: '🛡️' };
    }
    if (team === 'zayro') {
      return { label: 'ZAYRO', color: 'bg-amber-100 text-amber-900 border-amber-300', logo: '👑' };
    }
    return { label: 'LUCERO', color: 'bg-purple-100 text-purple-900 border-purple-300', logo: '⚡' };
  };

  const getPositionDisplay = (pos: 1 | 2 | 3 | null) => {
    if (pos === 1) return <span className="inline-flex items-center gap-1 font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">🥇 1st Place</span>;
    if (pos === 2) return <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">🥈 2nd Place</span>;
    if (pos === 3) return <span className="inline-flex items-center gap-1 font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">🥉 3rd Place</span>;
    return <span className="text-slate-500 text-xs">Participated</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Certificate Modal */}
      {activeCertificate && (
        <CertificatePreviewModal
          certificate={activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      {/* Header Banner */}
      <div className="no-print text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2.5">
          <Sparkles size={14} className="text-amber-600" />
          <span>{language === 'ml' ? 'പൊതുവിദ്യാർത്ഥി ഫല പരിശോധന' : 'Public Student Result Portal'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-wide mb-1.5">
          {getTranslation(language, 'checkYourResult')}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          {language === 'ml'
            ? 'വിദ്യാർത്ഥികൾക്ക് പാസ്‌വേഡ് ആവശ്യമില്ല. ചെസ്റ്റ് നമ്പർ നൽകുക.'
            : 'No login required. Search directly using your Chest Number, Student ID, or Admission Number.'}
        </p>
      </div>

      {/* Search Box Form */}
      <div className="no-print mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'studentSearchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer touch-target active:scale-95"
          >
            <Search size={18} />
            <span>{getTranslation(language, 'searchBtn')}</span>
          </button>
        </form>

        {/* Quick test pills for instant verification */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-500 text-[11px]">Quick Tests:</span>
          <button
            onClick={() => handleQuickLookup('102')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition cursor-pointer touch-target text-[11px] font-medium"
          >
            Chest #102 (Zayro • 1st Qur'an)
          </button>
          <button
            onClick={() => handleQuickLookup('101')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition cursor-pointer touch-target text-[11px] font-medium"
          >
            Chest #101 (Nayro • 2nd Qur'an)
          </button>
          <button
            onClick={() => handleQuickLookup('103')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition cursor-pointer touch-target text-[11px] font-medium"
          >
            Chest #103 (Lucero • 3rd Qur'an)
          </button>
        </div>
      </div>

      {/* Results View or No Results Notice */}
      {hasSearched && !searchedStudent && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center text-rose-900 max-w-xl mx-auto shadow-xs">
          <AlertCircle size={32} className="mx-auto text-rose-600 mb-2" />
          <h3 className="font-bold text-base mb-1">{language === 'ml' ? 'വിദ്യാർത്ഥിയെ കണ്ടെത്താനായില്ല' : 'Student Not Found'}</h3>
          <p className="text-xs text-rose-700">{getTranslation(language, 'noResultsFound')}</p>
        </div>
      )}

      {searchedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="printable-card rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6"
        >
          {/* Printable Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              {/* Photo with optimized image handling */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs shrink-0">
                {searchedStudent.photo_url ? (
                  <img
                    src={searchedStudent.photo_url}
                    alt={searchedStudent.student_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={28} />
                  </div>
                )}
              </div>

              {/* Basic Student Bio */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTeamBadge(searchedStudent.team).color}`}>
                    {getTeamBadge(searchedStudent.team).logo} {getTeamBadge(searchedStudent.team).label}
                  </span>
                  <span className="text-xs text-slate-500">
                    Chest: <strong className="text-slate-900 font-mono text-sm">#{searchedStudent.chest_number}</strong>
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-bold font-heading text-slate-900">
                  {searchedStudent.student_name}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                  <span>Class: <strong className="text-slate-800">{searchedStudent.class}</strong> ({searchedStudent.division})</span>
                  <span>•</span>
                  <span>ID: <strong className="text-slate-800 font-mono">{searchedStudent.student_id}</strong></span>
                </div>
              </div>
            </div>

            {/* Print button */}
            <div className="no-print flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition shadow-xs cursor-pointer touch-target"
              >
                <Printer size={15} />
                <span>{getTranslation(language, 'printResult')}</span>
              </button>
            </div>
          </div>

          {/* Points Earned Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-0.5">
                {getTranslation(language, 'totalPointsEarned')}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {totalPointsEarned} <span className="text-xs font-normal text-slate-500">PTS</span>
              </div>
              <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
                {language === 'ml' ? 'ഇൻഡിവിജ്വൽ & ജനറൽ ഇൻഡിവിജ്വൽ' : 'Individual & General Individual'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-0.5">
                {getTranslation(language, 'participatedEvents')}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-blue-900">
                {studentResults.length}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {studentResults.filter(r => {
                  const pr = programmes.find(p => p.id === r.programme_id);
                  return !isGroupOrTeamProgramme(pr);
                }).length} Individual • {studentResults.filter(r => {
                  const pr = programmes.find(p => p.id === r.programme_id);
                  return isGroupOrTeamProgramme(pr);
                }).length} Group
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-0.5">
                Top Honours
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-800">
                {studentResults.filter(r => r.position && r.position <= 3).length} Awards
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                Official Certifications
              </span>
            </div>
          </div>

          {/* Performance: Responsive Card-Based Layout for Mobile, Table on Desktop */}
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-amber-600" />
              <span>{language === 'ml' ? 'മത്സര ഫലങ്ങളുടെ വിശദാംശങ്ങൾ' : 'Official Published Programme Results'}</span>
            </h3>

            {studentResults.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                No verified results have been officially published for this student yet. Pending evaluation.
              </div>
            ) : (
              <>
                {/* Mobile Card List (Visible on mobile/tablet) */}
                <div className="md:hidden space-y-3">
                  {studentResults.map(res => {
                    const prg = programmes.find(p => p.id === res.programme_id);
                    const breakdown = calculateTotalResultPoints(prg, res.position, res.grade, festSettings.pointScheme);
                    const cType = getProgrammeCriteriaType(prg);

                    return (
                      <div key={res.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                {prg?.programme_code}
                              </span>
                              <span className="text-xs text-slate-500">{prg?.category || 'General'}</span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                {cType}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">{prg?.programme_name || 'Fest Event'}</h4>
                          </div>

                          <div className="text-right shrink-0">
                            {getPositionDisplay(res.position)}
                          </div>
                        </div>

                        {/* Marks & Grade Badges */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                          <div className="p-2 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Marks & Grade</span>
                            <strong className="text-slate-900">{res.total_marks} / {prg?.maximum_marks || 100}</strong>{' '}
                            <span className="px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 ml-1">Grade {res.grade || 'A'}</span>
                          </div>

                          <div className="p-2 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Points</span>
                            {breakdown.isGroup ? (
                              <span className="text-[11px] font-bold text-emerald-800">+{breakdown.totalPoints} to Team</span>
                            ) : (
                              <span className="text-xs font-bold text-amber-900">+{breakdown.studentPoints} PTS</span>
                            )}
                          </div>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 no-print">
                          <button
                            onClick={() => {
                              setPosterProgrammeId(res.programme_id);
                              setIsPosterModalOpen(true);
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 touch-target"
                          >
                            <Smartphone size={14} className="text-amber-600" />
                            <span>Poster</span>
                          </button>

                          {res.position && res.position <= 3 && (
                            <button
                              onClick={() => handleViewCertificate(res)}
                              className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 touch-target shadow-xs"
                            >
                              <Award size={14} />
                              <span>Certificate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">{getTranslation(language, 'programme')}</th>
                        <th className="px-4 py-3">{getTranslation(language, 'category')}</th>
                        <th className="px-4 py-3 text-center">{getTranslation(language, 'marks')}</th>
                        <th className="px-4 py-3 text-center">{getTranslation(language, 'grade')}</th>
                        <th className="px-4 py-3 text-center">{getTranslation(language, 'position')}</th>
                        <th className="px-4 py-3 text-center">{getTranslation(language, 'points')}</th>
                        <th className="px-4 py-3 text-right no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {studentResults.map(res => {
                        const prg = programmes.find(p => p.id === res.programme_id);
                        const breakdown = calculateTotalResultPoints(prg, res.position, res.grade, festSettings.pointScheme);
                        const cType = getProgrammeCriteriaType(prg);

                        return (
                          <tr key={res.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <div>{prg?.programme_name || 'Fest Event'}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-mono">{prg?.programme_code}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase font-mono ${
                                  cType === 'general' ? 'bg-purple-100 text-purple-900' :
                                  cType === 'group' ? 'bg-emerald-100 text-emerald-900' :
                                  'bg-amber-100 text-amber-900'
                                }`}>
                                  {cType}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                {prg?.category || 'General'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                              {res.total_marks} / {prg?.maximum_marks || 100}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {res.grade || 'A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getPositionDisplay(res.position)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {breakdown.isGroup ? (
                                <div>
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                                    0 PTS
                                  </span>
                                  <div className="text-[9px] text-emerald-700 font-mono font-medium mt-0.5">
                                    +{breakdown.totalPoints} to Team Tally
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-slate-900 font-mono text-sm">+{breakdown.studentPoints} PTS</div>
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    Pos: +{breakdown.positionPoints} | Gr: +{breakdown.gradePoints}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right no-print">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setPosterProgrammeId(res.programme_id);
                                    setIsPosterModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Generate WhatsApp Status Poster"
                                >
                                  <Smartphone size={13} className="text-amber-600" />
                                  <span>Poster</span>
                                </button>

                                {res.position && res.position <= 3 ? (
                                  <button
                                    onClick={() => handleViewCertificate(res)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    <Award size={13} />
                                    <span>Certificate</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-500 text-[10px] italic">Participation</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Privacy & Authenticity Footer */}
          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Verified by Board of Adjudicators, {festSettings.institutionName}</span>
            <span>Document generated on: {new Date().toLocaleDateString()}</span>
          </div>
        </motion.div>
      )}

      {/* WhatsApp Status Result Poster Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialProgrammeId={posterProgrammeId || undefined}
      />
    </div>
  );
};
