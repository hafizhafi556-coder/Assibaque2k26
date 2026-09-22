import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, X, Award, CheckCircle } from 'lucide-react';
import { Certificate, TeamId } from '../../types';
import { IslamicStar } from './IslamicPattern';
import { useFest } from '../../context/FestContext';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const { festSettings } = useFest();
  if (!certificate) return null;

  const logoUrl = festSettings?.festLogo || '/thanimiyyath-logo.svg';

  const handlePrint = () => {
    window.print();
  };

  const getPositionBadge = (pos: 1 | 2 | 3 | null | undefined) => {
    if (pos === 1) return { title: 'FIRST PLACE', ribbon: 'bg-amber-500 text-slate-950', ordinal: '1st' };
    if (pos === 2) return { title: 'SECOND PLACE', ribbon: 'bg-slate-300 text-slate-900', ordinal: '2nd' };
    if (pos === 3) return { title: 'THIRD PLACE', ribbon: 'bg-amber-700 text-amber-100', ordinal: '3rd' };
    return { title: 'ACHIEVEMENT', ribbon: 'bg-amber-600 text-white', ordinal: 'Honour' };
  };

  const posInfo = getPositionBadge(certificate.position);

  const getTeamColor = (team: TeamId) => {
    if (team === 'nayro') return 'text-sky-600 dark:text-sky-400';
    if (team === 'zayro') return 'text-amber-600 dark:text-amber-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl my-8 bg-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden print-modal"
        >
          {/* Top Bar with actions (Hidden in print) */}
          <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-semibold">
              <Award size={18} />
              <span>Official Arts Fest Certificate</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Printer size={15} />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Certificate Body (Clean high contrast for print and screen) */}
          <div className="p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 printable-card text-slate-100 relative">
            {/* Double Ornate Border */}
            <div className="border-4 border-amber-500/60 p-1 rounded-xl">
              <div className="border-2 border-dashed border-amber-400/40 p-6 sm:p-10 rounded-lg relative overflow-hidden text-center">
                
                {/* Official Logo Watermark Seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-[420px] max-w-[75%] max-h-[75%] object-contain opacity-[0.08] filter grayscale contrast-125 print:opacity-[0.10]"
                  />
                </div>

                {/* Institution Header */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <IslamicStar size={16} />
                    <span className="text-xs tracking-widest uppercase font-semibold">In the Name of Allah, the Most Gracious, the Most Merciful</span>
                    <IslamicStar size={16} />
                  </div>
                  <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-amber-200 tracking-wider">
                    {certificate.institution_name || 'IMAM SHAFI ISLAMIC ACADEMY'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 tracking-widest uppercase font-medium">
                    Department of Cultural & Literary Affairs
                  </p>
                </div>

                {/* Fest Title Ribbon & Logo */}
                <div className="flex items-center justify-center gap-3 my-4">
                  <img src={logoUrl} alt="Fest Logo" className="w-14 h-16 object-contain" />
                  <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border border-amber-400/40 text-amber-300 font-heading text-sm sm:text-base font-bold tracking-wider">
                    {certificate.fest_name} – {certificate.year}
                  </div>
                </div>

                {/* Certificate of Merit heading */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-widest uppercase drop-shadow">
                    Certificate of Excellence
                  </h2>
                  <p className="text-xs text-amber-400/90 font-medium italic mt-1">
                    This is to proudly certify that
                  </p>
                </div>

                {/* Student Recipient */}
                <div className="my-6">
                  <div className="text-2xl sm:text-4xl font-bold font-heading text-amber-300 tracking-wide underline decoration-amber-500/40 decoration-2 underline-offset-8">
                    {certificate.student_name}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    representing Team <span className={`font-extrabold uppercase tracking-wider ${getTeamColor(certificate.team)}`}>{certificate.team}</span>
                  </div>
                </div>

                {/* Award Details */}
                <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  has secured the prestigious <strong className="text-amber-300 text-sm sm:text-base">{posInfo.title} ({posInfo.ordinal})</strong> in the event <br />
                  <span className="font-heading text-base sm:text-lg font-bold text-white">"{certificate.programme_name}"</span>
                  {certificate.grade && (
                    <span> with <strong className="text-amber-400">Grade {certificate.grade}</strong></span>
                  )}
                  , displaying exemplary skill, artistry, and commendable dedication.
                </p>

                {/* Seal & Signatures */}
                <div className="mt-10 pt-6 border-t border-amber-500/30 flex items-end justify-between text-xs text-slate-400 px-2 sm:px-8">
                  {/* Left Signature */}
                  <div className="text-center">
                    <div className="h-10 flex items-center justify-center font-serif text-amber-300/80 italic text-base">
                      Abdul Rahman F.
                    </div>
                    <div className="w-28 sm:w-36 border-t border-slate-600 mx-auto pt-1 font-semibold text-slate-300">
                      Chief Judge
                    </div>
                  </div>

                  {/* Middle Official Fest Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400/60 bg-amber-500/10 flex flex-col items-center justify-center text-amber-400 shadow-inner">
                      <CheckCircle size={20} className="mb-0.5" />
                      <span className="text-[9px] font-bold tracking-tighter uppercase">VERIFIED</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Seal of Academy</span>
                  </div>

                  {/* Right Signature */}
                  <div className="text-center">
                    <div className="h-10 flex items-center justify-center font-serif text-amber-300/80 italic text-base">
                      Prof. Shafi N.
                    </div>
                    <div className="w-28 sm:w-36 border-t border-slate-600 mx-auto pt-1 font-semibold text-slate-300">
                      General Convener
                    </div>
                  </div>
                </div>

                {/* Footer Certificate Number & Date */}
                <div className="mt-8 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Cert. No: <strong className="text-slate-400">{certificate.certificate_number}</strong></span>
                  <span>Issued Date: <strong className="text-slate-400">{certificate.date}</strong></span>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
