import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Calendar, 
  User, 
  Users, 
  Building2, 
  FileText, 
  ArrowRight,
  Printer,
  Sparkles,
  QrCode,
  Check
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { Certificate } from '../../types';
import { CertificatePreviewModal } from '../certificate/CertificatePreviewModal';

interface CertificateVerificationViewProps {
  initialCertNumber?: string;
  onClose?: () => void;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({
  initialCertNumber = '',
  onClose,
}) => {
  const { certificates, festSettings } = useFest();
  const [searchQuery, setSearchQuery] = useState(initialCertNumber);
  const [foundCert, setFoundCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Check URL parameters on mount if any
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get('number') || params.get('cert') || initialCertNumber;
    if (num) {
      setSearchQuery(num);
      performSearch(num);
    }
  }, [initialCertNumber, certificates]);

  const performSearch = (query: string) => {
    setHasSearched(true);
    if (!query || !query.trim()) {
      setFoundCert(null);
      return;
    }
    const clean = query.trim().toUpperCase();
    const result = certificates.find(c => 
      c.certificate_number.trim().toUpperCase() === clean ||
      c.id === clean ||
      c.student_id.trim().toUpperCase() === clean
    );
    setFoundCert(result || null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {previewCert && (
        <CertificatePreviewModal
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-950 border border-emerald-500/30 text-white shadow-xl relative overflow-hidden text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-3 uppercase tracking-wider">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Official Public Credential Verification</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wide">
          {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
          Verify the authenticity and credentials of official certificates issued during {festSettings.festName} ({festSettings.festYear}).
        </p>

        {/* Verification Search Bar */}
        <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter Certificate Number (e.g. ISA-AF-2026-0001)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 text-white text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black transition shadow cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Verify</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {hasSearched && (
        <div>
          {foundCert ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-white space-y-6">
              {/* Authenticity Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${foundCert.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'}`}>
                    {foundCert.status === 'active' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${foundCert.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                        {foundCert.status === 'active' ? 'Verified Authentic Certificate' : 'Revoked Certificate'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{foundCert.certificate_number}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-heading mt-1 text-amber-200">
                      {foundCert.student_name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewCert(foundCert)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>View & Print Official Certificate</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Award / Achievement</span>
                  <div className="text-sm font-black text-amber-300">
                    {foundCert.position === 1 ? '🥇 First Position (1st)' : foundCert.position === 2 ? '🥈 Second Position (2nd)' : foundCert.position === 3 ? '🥉 Third Position (3rd)' : 'Participant Award'}
                  </div>
                  {foundCert.grade && (
                    <div className="text-xs text-slate-300 font-bold">Grade: {foundCert.grade}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Event / Programme</span>
                  <div className="text-sm font-black text-white">{foundCert.programme_name}</div>
                  <div className="text-xs text-slate-400 font-mono">{foundCert.programme_code} • {foundCert.category || 'General'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Student Credentials</span>
                  <div className="text-sm font-black text-white">Chest #{foundCert.chest_number}</div>
                  <div className="text-xs text-amber-300 uppercase font-bold">Team {foundCert.team.toUpperCase()} {foundCert.class_name ? `• ${foundCert.class_name}` : ''}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Fest & Institution</span>
                  <div className="text-sm font-black text-white">{foundCert.fest_name} ({foundCert.year})</div>
                  <div className="text-xs text-slate-400">{foundCert.institution_name}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Authorized Signatories</span>
                  <div className="text-xs font-bold text-slate-200">
                    1. {foundCert.fest_controller_name || 'IQBAL ASSHAFI'} (Fest Controller)
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    2. {foundCert.vice_principal_name || "RAFI ASH'ARY"} (Vice Principal)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Issue & Verification Date</span>
                  <div className="text-sm font-bold text-slate-200 font-mono">{foundCert.date}</div>
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={12} /> Database Match Confirmed
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center">
                <XCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">No Certificate Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No certificate was found with the number <strong>"{searchQuery}"</strong>. Please check for any typos or contact the fest administration desk.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recently Issued Verification Showcase */}
      {certificates.length > 0 && !hasSearched && (
        <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sample Issued Certificates ({certificates.length})
            </h3>
            <span className="text-[11px] text-amber-400 font-mono">Click to verify instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {certificates.slice(0, 6).map(cert => (
              <button
                key={cert.id}
                onClick={() => {
                  setSearchQuery(cert.certificate_number);
                  performSearch(cert.certificate_number);
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-left transition cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-amber-400 group-hover:text-amber-300">
                  {cert.certificate_number}
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {cert.student_name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {cert.programme_name} ({cert.position ? `#${cert.position}` : 'Participant'})
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
