import React, { useEffect, useState, useRef } from 'react';
import { Certificate, CertificateTheme } from '../../types';
import { generateCertificateQRCode } from '../../utils/certificateExporter';
import { Award, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';

interface CertificateCanvasProps {
  certificate: Certificate;
  previewMode?: boolean;
  onRefReady?: (el: HTMLDivElement | null) => void;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  certificate,
  previewMode = false,
  onRefReady,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onRefReady) {
      onRefReady(cardRef.current);
    }
  }, [onRefReady]);

  // Generate QR Code dynamically from certificate number and verification link
  useEffect(() => {
    let isMounted = true;
    const certNumber = certificate.certificate_number || 'ISA-AF-2026-0001';
    const verifyPayload = `${window.location.origin}/verify-certificate?number=${encodeURIComponent(certNumber)}`;
    generateCertificateQRCode(verifyPayload).then(url => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [certificate.certificate_number]);

  const theme: CertificateTheme = certificate.theme || 'emerald';

  // Theme-specific styling definitions
  const themeStyles = {
    emerald: {
      outerBorder: 'border-emerald-900/90 bg-[#fbfaf6]',
      innerBorder: 'border-amber-600/50',
      accentBorder: 'border-emerald-800/40',
      headerBg: 'bg-emerald-950 text-amber-200',
      bismillahColor: 'text-emerald-900',
      institutionColor: 'text-emerald-950',
      festTitleBg: 'bg-emerald-900/10 text-emerald-900 border-emerald-800/30',
      certTitleColor: 'text-amber-700',
      studentNameColor: 'text-emerald-950 border-emerald-900/30',
      badgeGold: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950',
      badgeSilver: 'bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 text-slate-900',
      badgeBronze: 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-amber-100',
      sealBorder: 'border-amber-600/70 text-amber-700',
      signatureLine: 'border-emerald-950/40 text-emerald-950',
      subTextColor: 'text-slate-700',
      cornerColor: '#064e3b',
      goldAccent: '#d97706',
    },
    navy: {
      outerBorder: 'border-slate-900 bg-[#f8fafc]',
      innerBorder: 'border-amber-500/60',
      accentBorder: 'border-blue-900/40',
      headerBg: 'bg-slate-950 text-amber-200',
      bismillahColor: 'text-blue-950',
      institutionColor: 'text-slate-950',
      festTitleBg: 'bg-blue-900/10 text-blue-950 border-blue-800/30',
      certTitleColor: 'text-amber-600',
      studentNameColor: 'text-slate-950 border-blue-950/30',
      badgeGold: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950',
      badgeSilver: 'bg-gradient-to-r from-slate-300 via-white to-slate-300 text-slate-900',
      badgeBronze: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100',
      sealBorder: 'border-amber-500/70 text-amber-600',
      signatureLine: 'border-slate-900/40 text-slate-950',
      subTextColor: 'text-slate-700',
      cornerColor: '#0f172a',
      goldAccent: '#f59e0b',
    },
    maroon: {
      outerBorder: 'border-rose-950 bg-[#fffdfa]',
      innerBorder: 'border-amber-600/60',
      accentBorder: 'border-rose-900/40',
      headerBg: 'bg-rose-950 text-amber-200',
      bismillahColor: 'text-rose-950',
      institutionColor: 'text-rose-950',
      festTitleBg: 'bg-rose-900/10 text-rose-950 border-rose-800/30',
      certTitleColor: 'text-rose-900',
      studentNameColor: 'text-rose-950 border-rose-900/30',
      badgeGold: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950',
      badgeSilver: 'bg-gradient-to-r from-slate-300 via-white to-slate-300 text-slate-900',
      badgeBronze: 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 text-amber-100',
      sealBorder: 'border-amber-600/70 text-amber-700',
      signatureLine: 'border-rose-950/40 text-rose-950',
      subTextColor: 'text-slate-700',
      cornerColor: '#4c0519',
      goldAccent: '#d97706',
    },
    charcoal: {
      outerBorder: 'border-zinc-900 bg-[#ffffff]',
      innerBorder: 'border-amber-500/60',
      accentBorder: 'border-zinc-700/40',
      headerBg: 'bg-zinc-950 text-amber-300',
      bismillahColor: 'text-zinc-900',
      institutionColor: 'text-zinc-950',
      festTitleBg: 'bg-zinc-900/10 text-zinc-900 border-zinc-700/30',
      certTitleColor: 'text-amber-600',
      studentNameColor: 'text-zinc-950 border-zinc-900/30',
      badgeGold: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950',
      badgeSilver: 'bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-300 text-zinc-900',
      badgeBronze: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100',
      sealBorder: 'border-amber-500/70 text-amber-600',
      signatureLine: 'border-zinc-900/40 text-zinc-950',
      subTextColor: 'text-zinc-700',
      cornerColor: '#18181b',
      goldAccent: '#eab308',
    },
    ivory: {
      outerBorder: 'border-amber-900/70 bg-[#faf7f0]',
      innerBorder: 'border-amber-600/40',
      accentBorder: 'border-amber-800/30',
      headerBg: 'bg-stone-900 text-amber-200',
      bismillahColor: 'text-stone-900',
      institutionColor: 'text-stone-950',
      festTitleBg: 'bg-amber-900/10 text-stone-900 border-amber-800/30',
      certTitleColor: 'text-amber-800',
      studentNameColor: 'text-stone-950 border-stone-800/30',
      badgeGold: 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-slate-950',
      badgeSilver: 'bg-gradient-to-r from-stone-300 via-white to-stone-300 text-stone-900',
      badgeBronze: 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100',
      sealBorder: 'border-amber-700/70 text-amber-800',
      signatureLine: 'border-stone-900/40 text-stone-950',
      subTextColor: 'text-stone-700',
      cornerColor: '#451a03',
      goldAccent: '#b45309',
    },
  }[theme];

  // Title formatting
  const certTitle = certificate.title || (
    certificate.certificate_type === 'achievement'
      ? 'CERTIFICATE OF ACHIEVEMENT'
      : certificate.certificate_type === 'special_award'
      ? 'SPECIAL AWARD CERTIFICATE'
      : 'CERTIFICATE OF PARTICIPATION'
  );

  // Position Badge computation
  const getPositionBadge = () => {
    if (certificate.position === 1) {
      return {
        label: 'FIRST POSITION',
        ribbon: themeStyles.badgeGold,
        ordinal: '1st',
        medal: '🥇',
      };
    }
    if (certificate.position === 2) {
      return {
        label: 'SECOND POSITION',
        ribbon: themeStyles.badgeSilver,
        ordinal: '2nd',
        medal: '🥈',
      };
    }
    if (certificate.position === 3) {
      return {
        label: 'THIRD POSITION',
        ribbon: themeStyles.badgeBronze,
        ordinal: '3rd',
        medal: '🥉',
      };
    }
    if (certificate.special_award_name) {
      return {
        label: certificate.special_award_name.toUpperCase(),
        ribbon: themeStyles.badgeGold,
        ordinal: 'Special',
        medal: '⭐',
      };
    }
    return null;
  };

  const posBadge = getPositionBadge();

  // Team color badge
  const getTeamBadgeColor = (t: string) => {
    const lower = t.toLowerCase();
    if (lower === 'nayro') return 'bg-sky-100 text-sky-900 border-sky-300';
    if (lower === 'zayro') return 'bg-amber-100 text-amber-900 border-amber-300';
    if (lower === 'lucero') return 'bg-purple-100 text-purple-900 border-purple-300';
    return 'bg-slate-100 text-slate-900 border-slate-300';
  };

  return (
    <div
      ref={cardRef}
      className={`certificate-printable relative w-full aspect-[297/210] max-w-[1100px] mx-auto p-4 sm:p-7 select-none overflow-hidden ${themeStyles.outerBorder} border-[10px] rounded-2xl shadow-2xl flex flex-col justify-between`}
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#fdfbf7',
        fontFamily: '"Cinzel", "Times New Roman", "Playfair Display", Georgia, serif',
      }}
    >
      {/* Intricate Islamic Arabesque Corner Ornaments (Vector SVG) */}
      <svg className="absolute top-2 left-2 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-85" viewBox="0 0 100 100" fill="none">
        <path d="M5 5 L45 5 C25 15, 15 25, 5 45 Z" fill={themeStyles.cornerColor} opacity="0.9" />
        <path d="M12 12 L38 12 C24 18, 18 24, 12 38 Z" fill={themeStyles.goldAccent} opacity="0.8" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" />
        <path d="M5 5 L95 5 L95 8 L8 8 L8 95 L5 95 Z" fill={themeStyles.cornerColor} />
      </svg>

      <svg className="absolute top-2 right-2 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-85 rotate-90" viewBox="0 0 100 100" fill="none">
        <path d="M5 5 L45 5 C25 15, 15 25, 5 45 Z" fill={themeStyles.cornerColor} opacity="0.9" />
        <path d="M12 12 L38 12 C24 18, 18 24, 12 38 Z" fill={themeStyles.goldAccent} opacity="0.8" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" />
        <path d="M5 5 L95 5 L95 8 L8 8 L8 95 L5 95 Z" fill={themeStyles.cornerColor} />
      </svg>

      <svg className="absolute bottom-2 left-2 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-85 -rotate-90" viewBox="0 0 100 100" fill="none">
        <path d="M5 5 L45 5 C25 15, 15 25, 5 45 Z" fill={themeStyles.cornerColor} opacity="0.9" />
        <path d="M12 12 L38 12 C24 18, 18 24, 12 38 Z" fill={themeStyles.goldAccent} opacity="0.8" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" />
        <path d="M5 5 L95 5 L95 8 L8 8 L8 95 L5 95 Z" fill={themeStyles.cornerColor} />
      </svg>

      <svg className="absolute bottom-2 right-2 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-85 rotate-180" viewBox="0 0 100 100" fill="none">
        <path d="M5 5 L45 5 C25 15, 15 25, 5 45 Z" fill={themeStyles.cornerColor} opacity="0.9" />
        <path d="M12 12 L38 12 C24 18, 18 24, 12 38 Z" fill={themeStyles.goldAccent} opacity="0.8" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" />
        <path d="M5 5 L95 5 L95 8 L8 8 L8 95 L5 95 Z" fill={themeStyles.cornerColor} />
      </svg>

      {/* Decorative Inner Frame */}
      <div className={`w-full h-full border-2 ${themeStyles.innerBorder} p-3 sm:p-5 rounded-xl relative flex flex-col justify-between overflow-hidden bg-white/40`}>
        {/* Subtle Guilloche / Islamic Geometry Watermark in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.045] overflow-hidden z-0">
          {certificate.fest_logo ? (
            <img src={certificate.fest_logo} alt="Watermark" className="w-[450px] max-w-[80%] max-h-[80%] object-contain" />
          ) : (
            <svg viewBox="0 0 200 200" className="w-[400px] h-[400px] fill-current text-amber-900">
              <polygon points="100,10 120,70 185,75 135,115 155,175 100,140 45,175 65,115 15,75 80,70" />
            </svg>
          )}
        </div>

        {/* 1. HEADER SECTION */}
        <div className="relative z-10 text-center space-y-1">
          {/* Islamic Invocation: Bismillah Calligraphy & English Meaning */}
          <div className="flex flex-col items-center justify-center">
            <div className={`text-base sm:text-xl font-bold tracking-widest ${themeStyles.bismillahColor}`} style={{ fontFamily: 'sans-serif' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div className="text-[8px] sm:text-[10px] tracking-[0.25em] text-slate-500 uppercase font-semibold">
              IN THE NAME OF ALLAH, THE MOST GRACIOUS, THE MOST MERCIFUL
            </div>
          </div>

          {/* Institution & Fest Top Branding */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 pt-1">
            {certificate.fest_logo && (
              <img
                src={certificate.fest_logo}
                alt="Fest Logo"
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-sm"
              />
            )}
            <div>
              <h1 className={`text-sm sm:text-2xl font-black tracking-wider uppercase ${themeStyles.institutionColor}`}>
                {certificate.institution_name || 'IMAM SHAFI ISLAMIC ACADEMY'}
              </h1>
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600 tracking-wide mt-0.5">
                <span className="text-amber-700 font-extrabold">{certificate.fest_name}</span>
                <span>•</span>
                <span className="italic font-medium text-slate-600 font-serif">"{certificate.fest_motto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ'}"</span>
                <span>•</span>
                <span className="font-bold text-amber-800">{certificate.year}</span>
              </div>
            </div>
          </div>

          {/* Ribbon / Divider */}
          <div className="w-48 sm:w-80 h-[2px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-1" />
        </div>

        {/* 2. CERTIFICATE TITLE SECTION */}
        <div className="relative z-10 text-center my-0.5 sm:my-1">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-black tracking-[0.18em] uppercase ${themeStyles.certTitleColor} drop-shadow-xs`}>
            {certTitle}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-600 tracking-widest uppercase font-semibold mt-0.5">
            This certificate is proudly presented to
          </p>
        </div>

        {/* 3. STUDENT RECIPIENT & CITATION SECTION */}
        <div className="relative z-10 text-center space-y-1 sm:space-y-2">
          {/* Optional Student Photo */}
          {certificate.show_photo && certificate.student_photo && (
            <div className="flex justify-center -mt-1 mb-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 to-amber-300 shadow-md">
                <img
                  src={certificate.student_photo}
                  alt={certificate.student_name}
                  className="w-full h-full object-cover rounded-full bg-slate-200"
                />
              </div>
            </div>
          )}

          {/* Student Name */}
          <div className="inline-block max-w-[90%]">
            <h3
              className={`text-xl sm:text-3xl md:text-4xl font-black font-serif tracking-wide px-4 py-0.5 border-b-2 ${themeStyles.studentNameColor}`}
            >
              {certificate.student_name}
            </h3>
          </div>

          {/* Student Meta Details: Chest No, Class, Team */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-700">
            {certificate.chest_number && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300/80 text-amber-900 font-mono">
                Chest #{certificate.chest_number}
              </span>
            )}
            {certificate.class_name && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800">
                Class: {certificate.class_name}
              </span>
            )}
            {certificate.team && (
              <span className={`px-2 py-0.5 rounded-md border font-black uppercase text-[10px] sm:text-xs ${getTeamBadgeColor(certificate.team)}`}>
                Team {certificate.team_name || certificate.team.toUpperCase()}
              </span>
            )}
          </div>

          {/* Citation Body Text */}
          <div className="max-w-2xl mx-auto px-4 text-[10px] sm:text-xs sm:leading-relaxed text-slate-800 font-medium">
            {certificate.certificate_type === 'achievement' ? (
              <p>
                for securing{' '}
                <strong className="font-extrabold text-amber-800 uppercase underline decoration-amber-500 decoration-1 underline-offset-2">
                  {posBadge ? posBadge.label : 'OUTSTANDING PERFORMANCE'}
                </strong>{' '}
                {certificate.grade && certificate.show_grade && (
                  <>with <strong className="font-black text-amber-900">Grade {certificate.grade}</strong> </>
                )}
                in the event{' '}
                <strong className="font-extrabold text-slate-950 font-serif">
                  "{certificate.programme_name}"
                </strong>
                {certificate.programme_code && (
                  <span className="text-slate-500 text-[10px] font-mono"> ({certificate.programme_code})</span>
                )}
                {certificate.category && (
                  <span> under <strong>{certificate.category}</strong> Category</span>
                )}
                {certificate.marks != null && certificate.show_marks && (
                  <span> (Score: <strong>{certificate.marks}/{certificate.max_marks || 100}</strong>)</span>
                )}
                {' '}at <strong>{certificate.fest_name}</strong> {certificate.year}.
              </p>
            ) : certificate.certificate_type === 'special_award' ? (
              <p>
                for being conferred with{' '}
                <strong className="font-extrabold text-amber-800 uppercase underline">
                  {certificate.special_award_name || 'SPECIAL RECOGNITION AWARD'}
                </strong>{' '}
                in{' '}
                <strong className="font-extrabold text-slate-950">
                  "{certificate.programme_name}"
                </strong>{' '}
                under {certificate.category || 'General'} Category at {certificate.fest_name} {certificate.year}.
              </p>
            ) : (
              <p>
                in recognition of active and commendable participation in the event{' '}
                <strong className="font-extrabold text-slate-950 font-serif">
                  "{certificate.programme_name}"
                </strong>
                {certificate.category && (
                  <span> under <strong>{certificate.category}</strong> Category</span>
                )}
                {' '}at <strong>{certificate.fest_name}</strong> {certificate.year}.
              </p>
            )}
          </div>
        </div>

        {/* 4. FOOTER: SIGNATORIES, SEAL, QR CODE & METADATA */}
        <div className="relative z-10 pt-2 sm:pt-3 border-t border-amber-600/30 flex items-end justify-between px-2 sm:px-6">
          
          {/* Left Signatory: Fest Controller (Strict: IQBAL ASSHAFI) */}
          <div className="w-32 sm:w-44 text-center">
            <div className="h-10 sm:h-12 flex items-center justify-center">
              {certificate.fest_controller_signature ? (
                <img
                  src={certificate.fest_controller_signature}
                  alt="Fest Controller Signature"
                  className="max-h-10 sm:max-h-12 max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="w-24 sm:w-32 h-[1px] bg-slate-400 mt-6" />
              )}
            </div>
            <div className="border-t border-slate-800/60 pt-1">
              <div className="text-[10px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">
                {certificate.fest_controller_name || 'IQBAL ASSHAFI'}
              </div>
              <div className="text-[8px] sm:text-[10px] font-bold text-amber-900 uppercase">
                {certificate.fest_controller_designation || 'Fest Controller'}
              </div>
            </div>
          </div>

          {/* Center: Official Golden Seal & Verification Metadata */}
          <div className="flex flex-col items-center justify-center shrink-0 mx-2">
            {/* Medallion / Seal */}
            <div
              className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 ${themeStyles.sealBorder} bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 shadow-sm flex flex-col items-center justify-center text-center p-1 relative overflow-hidden`}
            >
              <div className="absolute inset-0.5 border border-dashed border-amber-600/40 rounded-full pointer-events-none" />
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-amber-700" />
              <span className="text-[6px] sm:text-[8px] font-black tracking-tighter text-amber-900 uppercase leading-none mt-0.5">
                OFFICIAL SEAL
              </span>
              <span className="text-[5px] sm:text-[7px] font-extrabold text-amber-800">
                {certificate.year || '2026'}
              </span>
            </div>

            {/* Certificate Number & Date */}
            <div className="mt-1 text-center font-mono text-[7px] sm:text-[9px] text-slate-600 font-bold">
              <div>{certificate.certificate_number}</div>
              <div>Date: {certificate.date || '2026-09-25'}</div>
            </div>
          </div>

          {/* Right Signatory: Vice Principal (Strict: RAFI ASH'ARY) */}
          <div className="w-32 sm:w-44 text-center">
            <div className="h-10 sm:h-12 flex items-center justify-center">
              {certificate.vice_principal_signature ? (
                <img
                  src={certificate.vice_principal_signature}
                  alt="Vice Principal Signature"
                  className="max-h-10 sm:max-h-12 max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="w-24 sm:w-32 h-[1px] bg-slate-400 mt-6" />
              )}
            </div>
            <div className="border-t border-slate-800/60 pt-1">
              <div className="text-[10px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">
                {certificate.vice_principal_name || "RAFI ASH'ARY"}
              </div>
              <div className="text-[8px] sm:text-[10px] font-bold text-amber-900 uppercase">
                {certificate.vice_principal_designation || 'Vice Principal'}
              </div>
            </div>
          </div>

        </div>

        {/* QR Code Anchor (Bottom Right Corner) */}
        {certificate.show_qr && qrDataUrl && (
          <div className="absolute bottom-2 right-2 flex flex-col items-center bg-white/90 p-1 rounded border border-slate-300/80 shadow-xs">
            <img src={qrDataUrl} alt="Verify QR" className="w-9 h-9 sm:w-12 sm:h-12" />
            <span className="text-[5px] sm:text-[6px] font-mono text-slate-600 uppercase font-black">Scan to Verify</span>
          </div>
        )}

        {/* Revoked Banner Overlay (if certificate is revoked) */}
        {certificate.status === 'revoked' && (
          <div className="absolute inset-0 bg-rose-950/65 backdrop-blur-xs flex flex-col items-center justify-center text-white z-50">
            <div className="px-6 py-3 rounded-2xl bg-rose-600 border-2 border-white shadow-2xl text-center transform -rotate-6">
              <h4 className="text-xl sm:text-3xl font-black uppercase tracking-widest">
                CERTIFICATE REVOKED
              </h4>
              <p className="text-xs sm:text-sm font-medium mt-0.5">
                This document is no longer valid or authentic.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
