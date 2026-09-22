import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Printer, 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Smartphone, 
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  User as UserIcon,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useFest, calculateTotalResultPoints, formatParticipantDisplayName } from '../../context/FestContext';
import { IslamicStar } from './IslamicPattern';
import { TeamId } from '../../types';

interface ResultPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  programmeId?: string;
  initialProgrammeId?: string;
}

export const ResultPosterModal: React.FC<ResultPosterModalProps> = ({
  isOpen,
  onClose,
  programmeId,
  initialProgrammeId
}) => {
  const activeProgrammeId = initialProgrammeId || programmeId;
  const { 
    festSettings, 
    programmes, 
    results, 
    students, 
    teams,
    posters,
    currentUser,
    regenerateResultPoster,
    publishResultPoster
  } = useFest();

  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(
    activeProgrammeId || programmes.find(p => p.status === 'published' || p.status === 'completed')?.id || programmes[0]?.id || ''
  );

  // Update selectedProgrammeId if prop changes
  useEffect(() => {
    if (activeProgrammeId) {
      setSelectedProgrammeId(activeProgrammeId);
    }
  }, [activeProgrammeId]);

  // Aspect ratio: '4:5' (Primary vertical poster 1080x1350), '9:16' (WhatsApp status), '1:1' (Square)
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '9:16' | '1:1'>('4:5');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const posterCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const programmeResults = results
    .filter(r => r.programme_id === selectedProgrammeId)
    .sort((a, b) => {
      // Sort: 1st, 2nd, 3rd first, then by marks descending
      if (a.position && b.position) return a.position - b.position;
      if (a.position) return -1;
      if (b.position) return 1;
      return (b.total_marks || 0) - (a.total_marks || 0);
    });

  const isPublished = programmeResults.some(r => r.status === 'published');
  const posterRecord = posters.find(p => p.programme_id === selectedProgrammeId && p.status !== 'Archived');

  const topWinners = programmeResults.filter(r => r.position && r.position <= 3);
  const firstPlace = topWinners.find(r => r.position === 1);
  const secondPlace = topWinners.find(r => r.position === 2);
  const thirdPlace = topWinners.find(r => r.position === 3);
  const otherWinners = topWinners.filter(r => r !== firstPlace && r !== secondPlace && r !== thirdPlace);
  const gradeAHolders = programmeResults.filter(r => (!r.position || r.position > 3) && r.grade?.toUpperCase().startsWith('A'));

  const getTeamDetails = (teamId: TeamId | string) => {
    const t = teams.find(team => team.id.toLowerCase() === (teamId || '').toLowerCase());
    const primary = t?.primaryColor || '#0284c7';
    const accent = t?.accentColor || '#38bdf8';
    const name = t?.name || teamId.toUpperCase();

    switch ((teamId || '').toLowerCase()) {
      case 'nayro':
        return {
          name: t?.name || 'NAYRO',
          nameMl: t?.displayNameMl || 'നൈറോ',
          symbol: '🛡️',
          badgeClass: 'bg-sky-100 text-sky-950 border-sky-400 shadow-xs',
          cardBg: 'bg-sky-50/60 border-sky-300',
          textColor: 'text-sky-900',
          accent,
          primary
        };
      case 'zayro':
        return {
          name: t?.name || 'ZAYRO',
          nameMl: t?.displayNameMl || 'സൈറോ',
          symbol: '👑',
          badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs',
          cardBg: 'bg-amber-50/60 border-amber-300',
          textColor: 'text-amber-900',
          accent,
          primary
        };
      case 'lucero':
        return {
          name: t?.name || 'LUCERO',
          nameMl: t?.displayNameMl || 'ലൂസെറോ',
          symbol: '⚡',
          badgeClass: 'bg-purple-100 text-purple-950 border-purple-400 shadow-xs',
          cardBg: 'bg-purple-50/60 border-purple-300',
          textColor: 'text-purple-900',
          accent,
          primary
        };
      default:
        return {
          name: name.toUpperCase(),
          nameMl: t?.displayNameMl || name,
          symbol: '🏆',
          badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
          cardBg: 'bg-slate-50 border-slate-200',
          textColor: 'text-slate-900',
          accent,
          primary
        };
    }
  };

  // Download High-Resolution Poster Image (PNG)
  const handleDownloadImage = async (scaleMultiplier = 2.5) => {
    if (!posterCardRef.current) return;
    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(posterCardRef.current, {
        cacheBust: true,
        pixelRatio: scaleMultiplier, // 2.5x or 3x for 1080x1350 crisp 4:5 resolution
        backgroundColor: '#ffffff',
      });

      const safeCode = currentProgramme?.programme_code || 'RESULT';
      const safeName = (currentProgramme?.programme_name || 'Fest').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Result_Poster_${safeCode}_${safeName}_${aspectRatio.replace(':', 'x')}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // WhatsApp formatted text generation & sharing
  const generateWhatsAppText = () => {
    if (!currentProgramme) return '';

    const festTitle = festSettings.festName || 'തനിമിയ്യത്ത്';
    const festYr = festSettings.festYear || '2026';
    const instName = festSettings.institutionName || 'Imam Shafi Islamic Academy';
    const motto = festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ';

    let text = `🏆 *${festTitle.toUpperCase()} ${festYr}* 🏆\n`;
    if (festSettings.festNameMl) {
      text += `✨ *${festSettings.festNameMl} ${festYr}* ✨\n`;
    }
    text += `📜 *OFFICIAL RESULT BULLETIN*\n\n`;
    text += `📌 *Program:* ${currentProgramme.programme_code} - ${currentProgramme.programme_name}\n`;
    if (currentProgramme.programme_name_ml) {
      text += `🌟 *വിഭാഗം:* ${currentProgramme.programme_name_ml}\n`;
    }
    text += `📂 *Category:* ${currentProgramme.category} (${currentProgramme.type.toUpperCase()})\n\n`;
    text += `🎖️ *WINNERS LIST / വിജയികൾ:*\n`;

    if (topWinners.length === 0) {
      text += `(Results under adjudication / ഫലങ്ങൾ ക്രോഡീകരിക്കുന്നു)\n`;
    } else {
      topWinners.forEach(w => {
        const student = students.find(s => s.id === w.student_id);
        const displayName = formatParticipantDisplayName(student?.student_name, currentProgramme) || student?.student_name || 'Participant';
        const medal = w.position === 1 ? '🥇 *1st Place*' : w.position === 2 ? '🥈 *2nd Place*' : '🥉 *3rd Place*';
        const points = w.points_awarded || 0;
        text += `${medal}: ${displayName}\n`;
        text += `   ↳ Chest #${w.chest_number} | Team ${w.team.toUpperCase()} | Grade: ${w.grade || 'A'} (+${points} Pts)\n\n`;
      });
    }

    if (gradeAHolders.length > 0) {
      text += `⭐ *Grade A Holders:*\n`;
      gradeAHolders.slice(0, 5).forEach(gw => {
        const student = students.find(s => s.id === gw.student_id);
        text += `• ${student?.student_name || 'Participant'} (Chest #${gw.chest_number}, ${gw.team.toUpperCase()})\n`;
      });
      text += `\n`;
    }

    text += `🏛️ *${instName}*\n`;
    text += `_${motto}_\n`;
    text += `🔗 Official Fest Portal: ${window.location.origin}`;

    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleRegenerate = () => {
    if (!selectedProgrammeId) return;
    setIsRegenerating(true);
    regenerateResultPoster(selectedProgrammeId);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  // Helper component to render student winner photo
  const renderStudentPhoto = (student: typeof students[0] | undefined, sizeClass: string, isFirst = false) => {
    const photoUrl = student?.photo_url || student?.student_photo;
    
    if (photoUrl) {
      return (
        <div className={`relative ${sizeClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-md bg-white shrink-0 ${
          isFirst ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-slate-300 ring-2 ring-slate-200'
        }`}>
          <img
            src={photoUrl}
            alt={student?.student_name || 'Winner'}
            className="w-full h-full object-cover object-top"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Graceful fallback to silhouette on broken image
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-2 text-center text-slate-600">
                    <svg class="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span class="text-[8px] font-bold text-slate-600 uppercase leading-none">PHOTO NOT AVAILABLE</span>
                  </div>
                `;
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className={`relative ${sizeClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-md shrink-0 flex flex-col items-center justify-center p-2 text-center ${
        isFirst 
          ? 'bg-amber-50/70 border-amber-400 ring-4 ring-amber-400/30 text-amber-900' 
          : 'bg-slate-100 border-slate-300 ring-2 ring-slate-200 text-slate-700'
      }`}>
        <UserIcon className={`${isFirst ? 'w-8 h-8 sm:w-12 sm:h-12 text-amber-600' : 'w-7 h-7 sm:w-10 sm:h-10 text-slate-500'} mb-1`} />
        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-slate-600 leading-tight">
          PHOTO NOT AVAILABLE
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-3xl bg-white border border-amber-300 shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Trophy size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                  Official Result Poster Generator
                </h3>
                {isPublished ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-extrabold flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>✓ Published</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                    Draft / Preview
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                1080 × 1350 px (4:5 Ratio) • White Theme • Official Watermark & Verified Photos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          {/* Programme Selector Dropdown */}
          <div className="flex items-center gap-2 min-w-[240px] flex-1">
            <span className="text-slate-700 font-semibold text-[11px] shrink-0">Programme:</span>
            <select
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              className="w-full max-w-xs px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-amber-400 outline-none"
            >
              {programmes.map((p) => {
                const hasResults = results.some(r => r.programme_id === p.id && r.status === 'published');
                return (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900">
                    {p.programme_code} - {p.programme_name} {hasResults ? '✓ (Published)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Aspect Ratio Selector: 4:5 Poster, 9:16 Status, 1:1 Square */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setAspectRatio('4:5')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                aspectRatio === '4:5'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard 1080 × 1350 px Vertical Premium Poster (4:5)"
            >
              <Maximize2 size={12} />
              <span>4:5 Poster</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="WhatsApp Story / Mobile Status (9:16)"
            >
              <Smartphone size={12} />
              <span>9:16 Status</span>
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Square Post (1:1)"
            >
              <Layers size={12} />
              <span>1:1 Square</span>
            </button>
          </div>

          {/* Action Trigger / Sync Button */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition border border-amber-300 shadow-xs cursor-pointer"
              title="Sync fresh database marks and recreate poster record"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Poster'}</span>
            </button>
          )}
        </div>

        {/* Modal Body: Poster Preview Area */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-100 min-h-[460px]">
          
          {/* ========================================================================= */}
          {/* THE OFFICIAL 1080 x 1350 VERTICAL POSTER DOM CANVAS (WHITE THEME MODEL)  */}
          {/* ========================================================================= */}
          <div
            ref={posterCardRef}
            id="official-fest-result-poster"
            className={`relative overflow-hidden text-center select-none shadow-2xl transition-all duration-300 ${
              aspectRatio === '4:5'
                ? 'w-full max-w-[500px] min-h-[625px] aspect-[4/5]'
                : aspectRatio === '9:16'
                ? 'w-full max-w-[420px] min-h-[740px] aspect-[9/16]'
                : 'w-full max-w-[480px] min-h-[480px] aspect-square'
            } bg-white text-slate-950 flex flex-col justify-between p-4 sm:p-6 border-4 border-amber-400 rounded-3xl`}
          >
            {/* Elegant Double Inset Frame */}
            <div className="absolute inset-2 sm:inset-3 border border-amber-400/40 rounded-2xl pointer-events-none" />
            <div className="absolute inset-2.5 sm:inset-3.5 border border-dashed border-amber-500/30 rounded-2xl pointer-events-none" />

            {/* Corner Ornamental Flourishes */}
            <div className="absolute top-4 left-4 text-amber-600 pointer-events-none"><IslamicStar size={14} /></div>
            <div className="absolute top-4 right-4 text-amber-600 pointer-events-none"><IslamicStar size={14} /></div>
            <div className="absolute bottom-4 left-4 text-amber-600 pointer-events-none"><IslamicStar size={14} /></div>
            <div className="absolute bottom-4 right-4 text-amber-600 pointer-events-none"><IslamicStar size={14} /></div>

            {/* CRITICAL WATERMARK LEVEL LOGO BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
              <img
                src={festSettings.festLogo || '/thanimiyyath-logo.svg'}
                alt=""
                className="w-[440px] max-w-[85%] max-h-[85%] object-contain opacity-[0.08] filter grayscale contrast-125"
                crossOrigin="anonymous"
              />
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 1. HEADER SECTION (Dynamic from Fest Settings)                */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 pt-1 sm:pt-2 space-y-1">
              {/* Institution Header with Star Badge */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400 bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
                  {festSettings.festLogo ? (
                    <img 
                      src={festSettings.festLogo} 
                      alt="Fest Logo" 
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <IslamicStar size={24} className="text-amber-500" />
                  )}
                </div>

                <div className="text-left">
                  {/* Institution Name */}
                  <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest font-heading leading-tight">
                    {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                  </h4>
                  {festSettings.institutionNameMl && (
                    <p className="text-[9px] text-amber-800 font-bold font-serif leading-none">
                      {festSettings.institutionNameMl}
                    </p>
                  )}
                </div>
              </div>

              {/* Fest Name & Year Display in Bold Black Font */}
              <div className="pt-0.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  {festSettings.festName.toUpperCase()} {festSettings.festYear || '2026'}
                </h1>
                {festSettings.festNameMl && (
                  <p className="text-xs sm:text-sm font-extrabold text-amber-800 font-serif -mt-0.5">
                    {festSettings.festNameMl} {festSettings.festYear || '2026'}
                  </p>
                )}
              </div>

              {/* Fest Motto / Theme */}
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[9px] sm:text-[10px] font-serif italic text-amber-900 font-semibold shadow-xs">
                &ldquo;{festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ'}&rdquo;
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 2. PROGRAMME RESULT BANNER                                    */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 my-1 p-2 sm:p-2.5 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-xs">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-[9px] sm:text-[10px] tracking-wide uppercase shadow-xs">
                  {currentProgramme?.programme_code || 'EVENT'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-[8px] sm:text-[9px] uppercase tracking-wider">
                  🏆 OFFICIAL RESULT
                </span>
              </div>

              <h2 className="font-heading text-base sm:text-lg font-black text-slate-950 leading-tight">
                {currentProgramme?.programme_name || 'Fest Event'}
              </h2>
              {currentProgramme?.programme_name_ml && (
                <p className="text-[11px] font-bold text-amber-900 font-serif">
                  {currentProgramme.programme_name_ml}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 pt-1 text-[9px] sm:text-[10px] text-slate-600 font-semibold">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                  {currentProgramme?.category || 'General'}
                </span>
                <span className="text-amber-500 font-mono">•</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 uppercase">
                  {currentProgramme?.type || 'Stage'}
                </span>
                <span className="text-amber-500 font-mono">•</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                  Max Marks: {currentProgramme?.maximum_marks || 100}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3. WINNER SECTION WITH REAL PHOTOGRAPHS & HIERARCHY           */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-1 space-y-2">
              {topWinners.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                  <Trophy className="mx-auto mb-1 text-amber-500" size={24} />
                  Results for this programme are being compiled by the adjudication board.
                </div>
              ) : (
                <>
                  {/* FIRST POSITION (HERO WINNER CARD) */}
                  {firstPlace && (() => {
                    const student = students.find(s => s.id === firstPlace.student_id);
                    const displayName = formatParticipantDisplayName(student?.student_name, currentProgramme) || student?.student_name || 'Winner';
                    const teamInfo = getTeamDetails(firstPlace.team);
                    const breakdown = calculateTotalResultPoints(currentProgramme, 1, firstPlace.grade, festSettings.pointScheme);

                    return (
                      <div className="relative p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-2 border-amber-400 shadow-md flex items-center justify-between gap-3 text-left">
                        {/* Winner Photo */}
                        {renderStudentPhoto(student, 'w-14 h-14 sm:w-18 sm:h-18', true)}

                        {/* Winner Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow-xs">
                              🥇 1ST POSITION
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase border tracking-wider flex items-center gap-1 ${teamInfo.badgeClass}`}>
                              <span>{teamInfo.symbol}</span>
                              <span>{teamInfo.name}</span>
                            </span>
                          </div>

                          <h3 className="font-heading font-black text-sm sm:text-base text-slate-950 truncate">
                            {displayName}
                          </h3>

                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-600 font-mono mt-0.5 font-semibold">
                            <span className="font-bold text-amber-800">Chest #{firstPlace.chest_number}</span>
                            <span className="text-slate-300">•</span>
                            <span>Class: {student?.class || 'Senior'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-800 font-bold">{firstPlace.total_marks} Marks</span>
                          </div>
                        </div>

                        {/* Points & Grade Badge */}
                        <div className="text-right shrink-0">
                          {firstPlace.grade && (
                            <div className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[9px] font-black font-mono inline-block mb-1">
                              Grade {firstPlace.grade}
                            </div>
                          )}
                          <div className="font-mono font-black text-sm sm:text-base text-amber-900">
                            +{firstPlace.points_awarded || breakdown.totalPoints} <span className="text-[9px] font-bold text-amber-700">PTS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2ND AND 3RD POSITIONS (DUAL PODIUM / ROW) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* SECOND POSITION */}
                    {secondPlace && (() => {
                      const student = students.find(s => s.id === secondPlace.student_id);
                      const displayName = formatParticipantDisplayName(student?.student_name, currentProgramme) || student?.student_name || 'Runner Up';
                      const teamInfo = getTeamDetails(secondPlace.team);
                      const breakdown = calculateTotalResultPoints(currentProgramme, 2, secondPlace.grade, festSettings.pointScheme);

                      return (
                        <div className="relative p-2 sm:p-2.5 rounded-2xl bg-slate-50 border border-slate-300 flex items-center gap-2.5 text-left shadow-xs">
                          {renderStudentPhoto(student, 'w-11 h-11 sm:w-13 sm:h-13', false)}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-900 font-black text-[8px] uppercase tracking-wider">
                                🥈 2ND
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase border ${teamInfo.badgeClass}`}>
                                {teamInfo.name}
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-xs sm:text-sm text-slate-950 truncate">
                              {displayName}
                            </h4>
                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-600 font-mono font-semibold">
                              <span className="text-amber-800 font-bold">#{secondPlace.chest_number}</span>
                              <span>•</span>
                              <span>{secondPlace.total_marks} Marks</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono font-black text-xs text-slate-900">
                            +{secondPlace.points_awarded || breakdown.totalPoints}P
                          </div>
                        </div>
                      );
                    })()}

                    {/* THIRD POSITION */}
                    {thirdPlace && (() => {
                      const student = students.find(s => s.id === thirdPlace.student_id);
                      const displayName = formatParticipantDisplayName(student?.student_name, currentProgramme) || student?.student_name || 'Third Place';
                      const teamInfo = getTeamDetails(thirdPlace.team);
                      const breakdown = calculateTotalResultPoints(currentProgramme, 3, thirdPlace.grade, festSettings.pointScheme);

                      return (
                        <div className="relative p-2 sm:p-2.5 rounded-2xl bg-amber-50/50 border border-amber-300 flex items-center gap-2.5 text-left shadow-xs">
                          {renderStudentPhoto(student, 'w-11 h-11 sm:w-13 sm:h-13', false)}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 font-black text-[8px] uppercase tracking-wider">
                                🥉 3RD
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase border ${teamInfo.badgeClass}`}>
                                {teamInfo.name}
                              </span>
                            </div>
                            <h4 className="font-heading font-black text-xs sm:text-sm text-slate-950 truncate">
                              {displayName}
                            </h4>
                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-600 font-mono font-semibold">
                              <span className="text-amber-800 font-bold">#{thirdPlace.chest_number}</span>
                              <span>•</span>
                              <span>{thirdPlace.total_marks} Marks</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono font-black text-xs text-amber-900">
                            +{thirdPlace.points_awarded || breakdown.totalPoints}P
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* OTHER WINNERS / GRADE A PERFORMERS */}
                  {(otherWinners.length > 0 || gradeAHolders.length > 0) && (
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-left flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 font-bold text-amber-800 shrink-0">
                        <Award size={12} />
                        <span>Grade A Performers:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-5">
                        {gradeAHolders.slice(0, 4).map(gw => {
                          const st = students.find(s => s.id === gw.student_id);
                          return (
                            <span key={gw.id} className="px-1.5 py-0.2 rounded bg-white border border-slate-300 text-slate-900 font-semibold text-[8px]">
                              #{gw.chest_number} {st?.student_name.split(' ')[0]} ({gw.team.toUpperCase()})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 4. EXECUTIVE FOOTER (NO SIGNATURE - STRICT MANDATE)           */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 pt-2 border-t border-amber-300 text-center space-y-1">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-600 px-2 font-mono font-semibold">
                <span className="text-amber-900 font-black">
                  {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                </span>
                <span className="text-slate-800 font-bold">
                  {festSettings.festName} {festSettings.festYear || '2026'}
                </span>
                <span className="text-emerald-800 font-bold uppercase">
                  ✓ Official Result
                </span>
              </div>

              <div className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">
                &ldquo;{festSettings.festTheme || festSettings.festMotto || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ'}&rdquo; • Published: {new Date().toLocaleDateString()}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-amber-800 font-bold font-mono">
              {currentProgramme?.programme_code}
            </span>
            <span>•</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px]">
              {currentProgramme?.programme_name}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer touch-target active:scale-95"
              title="Share Official Result bulletin to WhatsApp"
            >
              <Share2 size={13} />
              <span>Share WhatsApp</span>
            </button>

            {/* Copy Bulletin Text */}
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs touch-target active:scale-95"
              title="Copy formatted result text"
            >
              {copiedText ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>

            {/* Download HD 1080x1350 PNG */}
            <button
              onClick={() => handleDownloadImage(3.0)}
              disabled={isGeneratingImage}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50 touch-target active:scale-95"
              title="Download High-Resolution 1080x1350 px PNG Poster"
            >
              <Download size={13} />
              <span>{isGeneratingImage ? 'Rendering HD...' : 'Download Poster (HD PNG)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
