import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Palette, 
  Check, 
  Share2, 
  QrCode, 
  User, 
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Certificate, CertificateTheme } from '../../types';
import { CertificateCanvas } from './CertificateCanvas';
import { downloadCertificatePdf, downloadCertificatePng, printCertificateElement } from '../../utils/certificateExporter';

interface CertificatePreviewModalProps {
  certificate: Certificate | null;
  onClose: () => void;
  onUpdateCertificate?: (updated: Certificate) => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  onClose,
  onUpdateCertificate,
}) => {
  const [activeCert, setActiveCert] = useState<Certificate | null>(certificate);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const canvasElRef = useRef<HTMLDivElement | null>(null);

  // Sync state when prop updates
  React.useEffect(() => {
    setActiveCert(certificate);
  }, [certificate]);

  if (!activeCert) return null;

  const themes: { id: CertificateTheme; label: string; bg: string }[] = [
    { id: 'emerald', label: 'Emerald Gold', bg: 'bg-emerald-700' },
    { id: 'navy', label: 'Midnight Navy', bg: 'bg-slate-900' },
    { id: 'maroon', label: 'Imperial Maroon', bg: 'bg-rose-900' },
    { id: 'charcoal', label: 'Classic Charcoal', bg: 'bg-zinc-800' },
    { id: 'ivory', label: 'Pearl Ivory', bg: 'bg-amber-100' },
  ];

  const handleThemeChange = (t: CertificateTheme) => {
    const updated = { ...activeCert, theme: t };
    setActiveCert(updated);
    if (onUpdateCertificate) onUpdateCertificate(updated);
  };

  const handleTogglePhoto = () => {
    const updated = { ...activeCert, show_photo: !activeCert.show_photo };
    setActiveCert(updated);
    if (onUpdateCertificate) onUpdateCertificate(updated);
  };

  const handleToggleQr = () => {
    const updated = { ...activeCert, show_qr: !activeCert.show_qr };
    setActiveCert(updated);
    if (onUpdateCertificate) onUpdateCertificate(updated);
  };

  const handleToggleMarks = () => {
    const updated = { ...activeCert, show_marks: !activeCert.show_marks };
    setActiveCert(updated);
    if (onUpdateCertificate) onUpdateCertificate(updated);
  };

  const handleDownloadPdf = async () => {
    if (!canvasElRef.current) return;
    setIsExportingPdf(true);
    try {
      const fileName = `Certificate_${activeCert.certificate_number}_${activeCert.student_name.replace(/\s+/g, '_')}.pdf`;
      await downloadCertificatePdf(canvasElRef.current, fileName);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!canvasElRef.current) return;
    setIsExportingPng(true);
    try {
      const fileName = `Certificate_${activeCert.certificate_number}_${activeCert.student_name.replace(/\s+/g, '_')}.png`;
      await downloadCertificatePng(canvasElRef.current, fileName);
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyVerifyUrl = () => {
    const verifyUrl = `${window.location.origin}/verify-certificate?number=${encodeURIComponent(activeCert.certificate_number)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-5xl my-auto bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                <Award size={18} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-heading">
                  Certificate Studio & Preview
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeCert.certificate_number} • {activeCert.student_name}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow cursor-pointer disabled:opacity-50"
              >
                <FileText size={14} />
                <span>{isExportingPdf ? 'Exporting...' : 'A4 PDF'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <ImageIcon size={14} />
                <span>{isExportingPng ? 'Saving...' : 'PNG'}</span>
              </button>

              <button
                onClick={() => printCertificateElement()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Customization Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs text-slate-300 shrink-0">
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Palette size={12} className="text-amber-400" /> Theme:
              </span>
              <div className="flex items-center gap-1.5">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      activeCert.theme === t.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.bg}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePhoto}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                  activeCert.show_photo
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700'
                }`}
              >
                <User size={12} />
                <span>Photo: {activeCert.show_photo ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleToggleQr}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                  activeCert.show_qr
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700'
                }`}
              >
                <QrCode size={12} />
                <span>QR: {activeCert.show_qr ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleToggleMarks}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                  activeCert.show_marks
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700'
                }`}
              >
                <span>Score: {activeCert.show_marks ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleCopyVerifyUrl}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                <span>{copiedUrl ? 'Link Copied!' : 'Copy Verify Link'}</span>
              </button>
            </div>
          </div>

          {/* Certificate Viewport (A4 Proportional Container) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40 flex items-center justify-center">
            <div className="w-full shadow-2xl rounded-2xl overflow-hidden">
              <CertificateCanvas
                certificate={activeCert}
                onRefReady={el => {
                  canvasElRef.current = el;
                }}
              />
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>A4 Landscape High-Resolution Layout (297 × 210 mm)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Signatories: <strong>{activeCert.fest_controller_name || 'IQBAL ASSHAFI'}</strong> & <strong>{activeCert.vice_principal_name || "RAFI ASH'ARY"}</strong></span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
