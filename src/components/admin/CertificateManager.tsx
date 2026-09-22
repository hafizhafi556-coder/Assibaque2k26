import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  FileText, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Upload, 
  Sliders, 
  Layers, 
  QrCode, 
  User, 
  CheckSquare, 
  Square,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Ban
} from 'lucide-react';
import { useFest, formatParticipantDisplayName } from '../../context/FestContext';
import { Certificate, CertificateType, CertificateTheme, Result, Student, Programme } from '../../types';
import { CertificatePreviewModal } from '../certificate/CertificatePreviewModal';
import { CertificateVerificationView } from '../public/CertificateVerificationView';
import { downloadCertificatePdf, downloadCertificatePng, printCertificateElement } from '../../utils/certificateExporter';

export const CertificateManager: React.FC = () => {
  const { 
    certificates, 
    results, 
    students, 
    programmes, 
    categories, 
    teams, 
    festSettings, 
    updateFestSettings,
    generateCertificate,
    bulkGenerateCertificates,
    revokeCertificate,
    restoreCertificate,
    deleteCertificate
  } = useFest();

  const [activeTab, setActiveTab] = useState<'studio' | 'bulk' | 'registry' | 'signatories' | 'verify'>('registry');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Bulk Generator State
  const [bulkFilterPosition, setBulkFilterPosition] = useState<'all' | '1' | '2' | '3' | 'winners' | 'participants'>('winners');
  const [bulkFilterProgramme, setBulkFilterProgramme] = useState<string>('all');
  const [bulkFilterCategory, setBulkFilterCategory] = useState<string>('all');
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());

  // Signatory & Settings Form State
  const [sigSettings, setSigSettings] = useState({
    fest_controller_name: festSettings.fest_controller_name || 'IQBAL ASSHAFI',
    fest_controller_designation: festSettings.fest_controller_designation || 'Fest Controller',
    fest_controller_signature: festSettings.fest_controller_signature || '',
    vice_principal_name: festSettings.vice_principal_name || "RAFI ASH'ARY",
    vice_principal_designation: festSettings.vice_principal_designation || 'Vice Principal',
    vice_principal_signature: festSettings.vice_principal_signature || '',
    certificate_prefix: festSettings.certificate_prefix || `ISA-AF-${festSettings.festYear || '2026'}-`,
    certificate_theme: festSettings.certificate_theme || 'emerald',
    certificate_show_photo: festSettings.certificate_show_photo ?? true,
    certificate_show_qr: festSettings.certificate_show_qr ?? true,
    certificate_show_marks: festSettings.certificate_show_marks ?? true,
    certificate_show_grade: festSettings.certificate_show_grade ?? true,
    certificate_show_code: festSettings.certificate_show_code ?? true,
    certificate_issue_date: festSettings.certificate_issue_date || '2026-09-25',
  });

  // Single Certificate Studio Form State
  const [studioProgrammeId, setStudioProgrammeId] = useState<string>('');
  const [studioResultId, setStudioResultId] = useState<string>('');
  const [studioCertType, setStudioCertType] = useState<CertificateType>('achievement');
  const [studioTitle, setStudioTitle] = useState<string>('CERTIFICATE OF ACHIEVEMENT');
  const [studioTheme, setStudioTheme] = useState<CertificateTheme>(festSettings.certificate_theme || 'emerald');

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Published Results eligible for certificates
  const publishedResults = useMemo(() => {
    return results.filter(r => r.status === 'published');
  }, [results]);

  const eligibleWinnersCount = useMemo(() => {
    return publishedResults.filter(r => r.position && r.position >= 1 && r.position <= 3).length;
  }, [publishedResults]);

  // Filtered Registry Certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => {
      const matchSearch = 
        c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.chest_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.programme_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTeam = filterTeam === 'all' || c.team === filterTeam;
      const matchType = filterType === 'all' || c.certificate_type === filterType;
      const matchCategory = filterCategory === 'all' || c.category === filterCategory;

      return matchSearch && matchTeam && matchType && matchCategory;
    });
  }, [certificates, searchQuery, filterTeam, filterType, filterCategory]);

  // Bulk Generator Candidate List (from Published Results)
  const bulkCandidates = useMemo(() => {
    return publishedResults.filter(r => {
      const prg = programmes.find(p => p.id === r.programme_id);
      if (bulkFilterProgramme !== 'all' && r.programme_id !== bulkFilterProgramme) return false;
      if (bulkFilterCategory !== 'all' && prg?.category !== bulkFilterCategory) return false;

      if (bulkFilterPosition === '1') return r.position === 1;
      if (bulkFilterPosition === '2') return r.position === 2;
      if (bulkFilterPosition === '3') return r.position === 3;
      if (bulkFilterPosition === 'winners') return r.position && r.position >= 1 && r.position <= 3;
      if (bulkFilterPosition === 'participants') return true;

      return true;
    });
  }, [publishedResults, programmes, bulkFilterProgramme, bulkFilterCategory, bulkFilterPosition]);

  // Toggle Bulk Selection
  const handleToggleSelectAllBulk = () => {
    if (bulkSelectedIds.size === bulkCandidates.length) {
      setBulkSelectedIds(new Set());
    } else {
      setBulkSelectedIds(new Set(bulkCandidates.map(c => c.id)));
    }
  };

  const handleToggleSelectBulkItem = (id: string) => {
    const next = new Set(bulkSelectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBulkSelectedIds(next);
  };

  // Run Bulk Certificate Generation
  const handleExecuteBulkGeneration = () => {
    const selectedResults = bulkCandidates.filter(r => bulkSelectedIds.has(r.id));
    if (selectedResults.length === 0) {
      showNotify('Please select at least one candidate from the list.');
      return;
    }

    const payloadList = selectedResults.map(r => {
      const prg = programmes.find(p => p.id === r.programme_id);
      const stu = students.find(s => s.id === r.student_id || s.chest_number === r.chest_number);
      const isWinner = r.position && r.position >= 1 && r.position <= 3;
      const certType: CertificateType = isWinner ? 'achievement' : 'participation';

      return {
        student_id: stu?.id || r.student_id || r.chest_number,
        student_name: formatParticipantDisplayName(stu?.student_name, prg) || stu?.student_name || `Chest #${r.chest_number}`,
        chest_number: r.chest_number,
        class_name: stu?.class ? `${stu.class} ${stu.division || ''}`.trim() : '',
        student_photo: stu?.photo_url || '',
        programme_id: r.programme_id,
        programme_code: prg?.programme_code || '',
        programme_name: prg?.programme_name || 'Fest Event',
        category: prg?.category || '',
        position: r.position as (1 | 2 | 3 | null),
        grade: r.grade,
        marks: r.total_marks,
        max_marks: 100,
        team: r.team,
        team_name: r.team.toUpperCase(),
        certificate_type: certType,
        title: certType === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION',
        fest_name: festSettings.festName,
        fest_motto: festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
        fest_logo: festSettings.festLogo,
        year: festSettings.festYear,
        date: sigSettings.certificate_issue_date || '2026-09-25',
        institution_name: festSettings.institutionName,
        fest_controller_name: sigSettings.fest_controller_name,
        fest_controller_designation: sigSettings.fest_controller_designation,
        fest_controller_signature: sigSettings.fest_controller_signature,
        vice_principal_name: sigSettings.vice_principal_name,
        vice_principal_designation: sigSettings.vice_principal_designation,
        vice_principal_signature: sigSettings.vice_principal_signature,
        theme: sigSettings.certificate_theme,
        show_photo: sigSettings.certificate_show_photo,
        show_qr: sigSettings.certificate_show_qr,
        show_marks: sigSettings.certificate_show_marks,
        show_grade: sigSettings.certificate_show_grade,
      };
    });

    const generated = bulkGenerateCertificates(payloadList);
    showNotify(`Successfully generated ${generated.length} official certificates!`);
    setActiveTab('registry');
  };

  // Generate Single Certificate from Studio
  const handleGenerateSingleStudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioResultId) {
      showNotify('Please select a student result to generate certificate.');
      return;
    }

    const r = results.find(item => item.id === studioResultId);
    if (!r) return;

    const prg = programmes.find(p => p.id === r.programme_id);
    const stu = students.find(s => s.id === r.student_id || s.chest_number === r.chest_number);

    const newCert = generateCertificate({
      student_id: stu?.id || r.student_id || r.chest_number,
      student_name: formatParticipantDisplayName(stu?.student_name, prg) || stu?.student_name || `Chest #${r.chest_number}`,
      chest_number: r.chest_number,
      class_name: stu?.class ? `${stu.class} ${stu.division || ''}`.trim() : '',
      student_photo: stu?.photo_url || '',
      programme_id: r.programme_id,
      programme_code: prg?.programme_code || '',
      programme_name: prg?.programme_name || 'Fest Event',
      category: prg?.category || '',
      position: r.position as (1 | 2 | 3 | null),
      grade: r.grade,
      marks: r.total_marks,
      max_marks: 100,
      team: r.team,
      team_name: r.team.toUpperCase(),
      certificate_type: studioCertType,
      title: studioTitle,
      fest_name: festSettings.festName,
      fest_motto: festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ',
      fest_logo: festSettings.festLogo,
      year: festSettings.festYear,
      date: sigSettings.certificate_issue_date || '2026-09-25',
      institution_name: festSettings.institutionName,
      fest_controller_name: sigSettings.fest_controller_name,
      fest_controller_designation: sigSettings.fest_controller_designation,
      fest_controller_signature: sigSettings.fest_controller_signature,
      vice_principal_name: sigSettings.vice_principal_name,
      vice_principal_designation: sigSettings.vice_principal_designation,
      vice_principal_signature: sigSettings.vice_principal_signature,
      theme: studioTheme,
      show_photo: sigSettings.certificate_show_photo,
      show_qr: sigSettings.certificate_show_qr,
      show_marks: sigSettings.certificate_show_marks,
      show_grade: sigSettings.certificate_show_grade,
    });

    setSelectedCert(newCert);
    showNotify(`Certificate #${newCert.certificate_number} successfully created!`);
  };

  // Handle Signature Uploads
  const handleSignatureUpload = (signatory: 'controller' | 'vice_principal', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        if (signatory === 'controller') {
          setSigSettings(prev => ({ ...prev, fest_controller_signature: dataUrl }));
        } else {
          setSigSettings(prev => ({ ...prev, vice_principal_signature: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Signatures and Settings
  const handleSaveSignatures = (e: React.FormEvent) => {
    e.preventDefault();
    updateFestSettings({
      fest_controller_name: sigSettings.fest_controller_name,
      fest_controller_designation: sigSettings.fest_controller_designation,
      fest_controller_signature: sigSettings.fest_controller_signature,
      vice_principal_name: sigSettings.vice_principal_name,
      vice_principal_designation: sigSettings.vice_principal_designation,
      vice_principal_signature: sigSettings.vice_principal_signature,
      certificate_prefix: sigSettings.certificate_prefix,
      certificate_theme: sigSettings.certificate_theme,
      certificate_show_photo: sigSettings.certificate_show_photo,
      certificate_show_qr: sigSettings.certificate_show_qr,
      certificate_show_marks: sigSettings.certificate_show_marks,
      certificate_show_grade: sigSettings.certificate_show_grade,
      certificate_show_code: sigSettings.certificate_show_code,
      certificate_issue_date: sigSettings.certificate_issue_date,
    });
    showNotify('Official signatories and certificate settings successfully saved!');
  };

  return (
    <div className="space-y-6">
      {/* Active Certificate Preview Modal */}
      {selectedCert && (
        <CertificatePreviewModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          onUpdateCertificate={(upd) => setSelectedCert(upd)}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <FileCheck size={22} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-wide">
              Official Certificates Generation System
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Generate high-resolution, verifiable A4 landscape certificates with Islamic arabesque motifs, automated QR code verification, and official authorized signatories.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Issued</span>
            <span className="text-base font-black text-amber-300 font-mono">{certificates.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eligible Winners</span>
            <span className="text-base font-black text-emerald-300 font-mono">{eligibleWinnersCount}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'registry'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers size={15} />
          <span>Issued Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'bulk'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles size={15} />
          <span>Bulk Generation Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus size={15} />
          <span>Single Certificate Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('signatories')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'signatories'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings size={15} />
          <span>Signatories & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'verify'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Public Verifier</span>
        </button>
      </div>

      {/* 1. ISSUED CERTIFICATES REGISTRY */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by student name, chest #, certificate #..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterTeam}
                onChange={e => setFilterTeam(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value="all">All Teams</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="achievement">Achievement</option>
                <option value="participation">Participation</option>
                <option value="special_award">Special Award</option>
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          {filteredCertificates.length > 0 ? (
            <div className="overflow-x-auto rounded-3xl border border-slate-800 shadow-xl bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Cert #</th>
                    <th className="p-3.5">Student & Chest</th>
                    <th className="p-3.5">Team</th>
                    <th className="p-3.5">Event & Category</th>
                    <th className="p-3.5">Position / Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCertificates.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        {cert.certificate_number}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{cert.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Chest #{cert.chest_number} {cert.class_name ? `• ${cert.class_name}` : ''}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                          {cert.team}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{cert.programme_name}</div>
                        <div className="text-[10px] text-slate-400">{cert.category || 'General'}</div>
                      </td>
                      <td className="p-3.5">
                        {cert.position === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            🥇 1st Place
                          </span>
                        ) : cert.position === 2 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-300/20 text-slate-200 border border-slate-400/30">
                            🥈 2nd Place
                          </span>
                        ) : cert.position === 3 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-800/20 text-amber-200 border border-amber-700/30">
                            🥉 3rd Place
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-900/20 text-blue-300 border border-blue-700/30">
                            Participation
                          </span>
                        )}
                        {cert.grade && (
                          <span className="ml-1 text-[10px] text-amber-400 font-bold">({cert.grade})</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cert.status === 'active' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
                            title="Preview / Print / PDF"
                          >
                            <Eye size={15} />
                          </button>

                          {cert.status === 'active' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Revoke certificate #${cert.certificate_number}?`)) {
                                  revokeCertificate(cert.id);
                                  showNotify(`Revoked certificate #${cert.certificate_number}`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                              title="Revoke Certificate"
                            >
                              <Ban size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                restoreCertificate(cert.id);
                                showNotify(`Restored certificate #${cert.certificate_number}`);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 transition"
                              title="Restore Certificate"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete certificate record #${cert.certificate_number}?`)) {
                                deleteCertificate(cert.id);
                                showNotify(`Deleted certificate #${cert.certificate_number}`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <FileCheck size={28} />
              </div>
              <h3 className="text-base font-bold text-white">No Certificates Issued Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use the <strong>Bulk Generation Engine</strong> to automatically issue certificates for all 1st, 2nd, and 3rd place winners with one click!
              </p>
              <button
                onClick={() => setActiveTab('bulk')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Open Bulk Generator</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. BULK GENERATION ENGINE */}
      {activeTab === 'bulk' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black font-heading text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <span>Bulk Certificate Generator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Filter published results, select multiple candidates, and generate official certificates with automated numbering in a single batch.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Position / Filter Tier</label>
                <select
                  value={bulkFilterPosition}
                  onChange={e => setBulkFilterPosition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold"
                >
                  <option value="winners">All Winners (1st, 2nd, 3rd)</option>
                  <option value="1">1st Place Only</option>
                  <option value="2">2nd Place Only</option>
                  <option value="3">3rd Place Only</option>
                  <option value="participants">All Published Participants</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Category</label>
                <select
                  value={bulkFilterCategory}
                  onChange={e => setBulkFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Programme / Event</label>
                <select
                  value={bulkFilterProgramme}
                  onChange={e => setBulkFilterProgramme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="all">All Programmes</option>
                  {programmes.map(p => (
                    <option key={p.id} value={p.id}>{p.programme_code} • {p.programme_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleSelectAllBulk}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  {bulkSelectedIds.size === bulkCandidates.length && bulkCandidates.length > 0 ? (
                    <CheckSquare size={14} className="text-amber-400" />
                  ) : (
                    <Square size={14} className="text-slate-500" />
                  )}
                  <span>Select All ({bulkCandidates.length})</span>
                </button>
                <span className="text-xs text-slate-400">
                  Selected: <strong className="text-amber-300">{bulkSelectedIds.size}</strong> candidates
                </span>
              </div>

              <button
                onClick={handleExecuteBulkGeneration}
                disabled={bulkSelectedIds.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                <FileCheck size={16} />
                <span>Generate {bulkSelectedIds.size} Official Certificates</span>
              </button>
            </div>
          </div>

          {/* Candidate List Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10">Select</th>
                  <th className="p-3.5">Student & Chest</th>
                  <th className="p-3.5">Team</th>
                  <th className="p-3.5">Programme</th>
                  <th className="p-3.5">Position & Score</th>
                  <th className="p-3.5">Existing Cert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bulkCandidates.map(r => {
                  const prg = programmes.find(p => p.id === r.programme_id);
                  const stu = students.find(s => s.id === r.student_id || s.chest_number === r.chest_number);
                  const isSelected = bulkSelectedIds.has(r.id);
                  const existingCert = certificates.find(c => c.student_id === r.student_id && c.programme_id === r.programme_id);

                  return (
                    <tr key={r.id} className={`hover:bg-slate-800/40 transition cursor-pointer ${isSelected ? 'bg-amber-500/10' : ''}`} onClick={() => handleToggleSelectBulkItem(r.id)}>
                      <td className="p-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectBulkItem(r.id)}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">
                          {formatParticipantDisplayName(stu?.student_name, prg) || stu?.student_name || `Chest #${r.chest_number}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">Chest #{r.chest_number}</div>
                      </td>
                      <td className="p-3.5 uppercase font-bold text-[11px]">
                        {r.team}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{prg?.programme_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{prg?.programme_code} • {prg?.category}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-amber-300">
                          {r.position === 1 ? '🥇 1st Place' : r.position === 2 ? '🥈 2nd Place' : r.position === 3 ? '🥉 3rd Place' : 'Participation'}
                        </div>
                        <div className="text-[10px] text-slate-400">Score: {r.total_marks || 0} pts {r.grade ? `(${r.grade})` : ''}</div>
                      </td>
                      <td className="p-3.5">
                        {existingCert ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            #{existingCert.certificate_number}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Not generated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SINGLE CERTIFICATE STUDIO */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-black font-heading text-white flex items-center gap-2">
              <Plus size={18} className="text-amber-400" />
              <span>Generate Single Certificate</span>
            </h3>

            <form onSubmit={handleGenerateSingleStudio} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Published Event</label>
                <select
                  value={studioProgrammeId}
                  onChange={e => {
                    setStudioProgrammeId(e.target.value);
                    setStudioResultId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="">-- Choose Programme --</option>
                  {programmes.map(p => (
                    <option key={p.id} value={p.id}>{p.programme_code} • {p.programme_name}</option>
                  ))}
                </select>
              </div>

              {studioProgrammeId && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Participant / Result</label>
                  <select
                    value={studioResultId}
                    onChange={e => {
                      const resId = e.target.value;
                      setStudioResultId(resId);
                      const r = results.find(item => item.id === resId);
                      if (r) {
                        const isWin = r.position && r.position >= 1 && r.position <= 3;
                        setStudioCertType(isWin ? 'achievement' : 'participation');
                        setStudioTitle(isWin ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold"
                  >
                    <option value="">-- Choose Participant --</option>
                    {results.filter(r => r.programme_id === studioProgrammeId && r.status === 'published').map(r => {
                      const stu = students.find(s => s.id === r.student_id);
                      return (
                        <option key={r.id} value={r.id}>
                          #{r.chest_number} - {stu?.student_name || `Chest #${r.chest_number}`} ({r.position ? `Pos: ${r.position}` : 'Participant'})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Certificate Type</label>
                <select
                  value={studioCertType}
                  onChange={e => {
                    const t = e.target.value as CertificateType;
                    setStudioCertType(t);
                    setStudioTitle(t === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : t === 'special_award' ? 'SPECIAL AWARD CERTIFICATE' : 'CERTIFICATE OF PARTICIPATION');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="achievement">Certificate of Achievement (1st, 2nd, 3rd / Grade)</option>
                  <option value="participation">Certificate of Participation</option>
                  <option value="special_award">Special Recognition Award</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Custom Title</label>
                <input
                  type="text"
                  value={studioTitle}
                  onChange={e => setStudioTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Visual Theme</label>
                <select
                  value={studioTheme}
                  onChange={e => setStudioTheme(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="emerald">Emerald Green & Gold</option>
                  <option value="navy">Midnight Navy & Gold</option>
                  <option value="maroon">Imperial Maroon & Gold</option>
                  <option value="charcoal">Classic Charcoal & Gold</option>
                  <option value="ivory">Pearl Ivory Minimalist</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!studioResultId}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>Generate & Preview Certificate</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
            <Award className="w-16 h-16 text-amber-500/30 mb-3" />
            <h4 className="text-base font-bold text-white">Live Certificate Studio</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select a participant from the left panel and generate a certificate to preview, print, or download A4 PDF with official signatures.
            </p>
          </div>
        </div>
      )}

      {/* 4. SIGNATORIES & CERTIFICATE SETTINGS */}
      {activeTab === 'signatories' && (
        <form onSubmit={handleSaveSignatures} className="space-y-6 max-w-4xl">
          {/* Signatories Configuration Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-base font-black font-heading text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <span>Authorized Signatories (Strict Islamic Arts Fest Protocol)</span>
              </h3>
              <p className="text-xs text-slate-400">
                The certificate strictly features two authorized signatories: <strong>Fest Controller</strong> and <strong>Vice Principal</strong>. You can upload signature scans (PNG, JPG, WEBP).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Signatory: Fest Controller */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase">Left Signatory (Fest Controller)</span>
                  <span className="text-[10px] text-slate-500">Official Official</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Official Name</label>
                  <input
                    type="text"
                    required
                    value={sigSettings.fest_controller_name}
                    onChange={e => setSigSettings(prev => ({ ...prev, fest_controller_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Official Designation</label>
                  <input
                    type="text"
                    required
                    value={sigSettings.fest_controller_designation}
                    onChange={e => setSigSettings(prev => ({ ...prev, fest_controller_designation: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Upload Signature Image (PNG/JPG)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition cursor-pointer border border-amber-500/30">
                      <Upload size={14} />
                      <span>{sigSettings.fest_controller_signature ? 'Replace Signature' : 'Upload PNG'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={e => handleSignatureUpload('controller', e)}
                        className="hidden"
                      />
                    </label>
                    {sigSettings.fest_controller_signature && (
                      <button
                        type="button"
                        onClick={() => setSigSettings(prev => ({ ...prev, fest_controller_signature: '' }))}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {sigSettings.fest_controller_signature && (
                    <div className="mt-2 p-2 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
                      <img src={sigSettings.fest_controller_signature} alt="Controller Sig" className="max-h-12 object-contain filter invert" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Signatory: Vice Principal */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase">Right Signatory (Vice Principal)</span>
                  <span className="text-[10px] text-slate-500">Official Official</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Official Name</label>
                  <input
                    type="text"
                    required
                    value={sigSettings.vice_principal_name}
                    onChange={e => setSigSettings(prev => ({ ...prev, vice_principal_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Official Designation</label>
                  <input
                    type="text"
                    required
                    value={sigSettings.vice_principal_designation}
                    onChange={e => setSigSettings(prev => ({ ...prev, vice_principal_designation: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Upload Signature Image (PNG/JPG)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition cursor-pointer border border-amber-500/30">
                      <Upload size={14} />
                      <span>{sigSettings.vice_principal_signature ? 'Replace Signature' : 'Upload PNG'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={e => handleSignatureUpload('vice_principal', e)}
                        className="hidden"
                      />
                    </label>
                    {sigSettings.vice_principal_signature && (
                      <button
                        type="button"
                        onClick={() => setSigSettings(prev => ({ ...prev, vice_principal_signature: '' }))}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {sigSettings.vice_principal_signature && (
                    <div className="mt-2 p-2 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
                      <img src={sigSettings.vice_principal_signature} alt="Vice Principal Sig" className="max-h-12 object-contain filter invert" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Layout & Numbering Rules */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-black font-heading text-white flex items-center gap-2">
              <Sliders size={18} className="text-amber-400" />
              <span>Certificate Numbering & Layout Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Certificate Prefix</label>
                <input
                  type="text"
                  value={sigSettings.certificate_prefix}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_prefix: e.target.value }))}
                  placeholder="ISA-AF-2026-"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Issue Date</label>
                <input
                  type="date"
                  value={sigSettings.certificate_issue_date}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_issue_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Default Visual Theme</label>
                <select
                  value={sigSettings.certificate_theme}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_theme: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="emerald">Emerald Green & Gold</option>
                  <option value="navy">Midnight Navy & Gold</option>
                  <option value="maroon">Imperial Maroon & Gold</option>
                  <option value="charcoal">Classic Charcoal & Gold</option>
                  <option value="ivory">Pearl Ivory Minimalist</option>
                </select>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  checked={sigSettings.certificate_show_photo}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_show_photo: e.target.checked }))}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">Show Student Photo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  checked={sigSettings.certificate_show_qr}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_show_qr: e.target.checked }))}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">Show QR Verification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  checked={sigSettings.certificate_show_marks}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_show_marks: e.target.checked }))}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">Show Total Score</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <input
                  type="checkbox"
                  checked={sigSettings.certificate_show_grade}
                  onChange={e => setSigSettings(prev => ({ ...prev, certificate_show_grade: e.target.checked }))}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">Show Grade (A/B/C)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            <span>Save All Certificate Settings & Signatories</span>
          </button>
        </form>
      )}

      {/* 5. PUBLIC VERIFIER TESTING TAB */}
      {activeTab === 'verify' && (
        <div className="p-2">
          <CertificateVerificationView />
        </div>
      )}
    </div>
  );
};
