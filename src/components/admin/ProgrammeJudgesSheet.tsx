import React, { useState, useRef } from 'react';
import { Printer, Download, Filter, FileText, Layers, ExternalLink, Sparkles, CheckCircle2, Mic, PenTool, LayoutGrid, Settings2, Sliders, Maximize2 } from 'lucide-react';
import { useFest, formatParticipantDisplayName } from '../../context/FestContext';
import { Programme } from '../../types';

export const ProgrammeJudgesSheet: React.FC = () => {
  const { programmes, participants, students, teams, categories: definedCategories, festSettings } = useFest();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'stage' | 'non_stage'>('all');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatusMessage, setPrintStatusMessage] = useState<string | null>(null);

  // Print paper size and orientation customization
  const [paperSize, setPaperSize] = useState<'A4' | 'Legal' | 'A3' | 'Letter' | 'A5'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showCodeLetter, setShowCodeLetter] = useState<boolean>(true);
  const [prefillLetters, setPrefillLetters] = useState<boolean>(false); // Default false: Blank column for writing by hand
  const [showStudentName, setShowStudentName] = useState<boolean>(true);
  const [showTeam, setShowTeam] = useState<boolean>(true);

  // Derive unique categories from both defined categories list and programmes data
  const rawCategories = Array.from(new Set([
    ...programmes.map(p => p.category),
    ...(definedCategories || []).map(c => c.code || c.name)
  ])).filter(Boolean);

  // Helper to determine if a programme is Stage or Non-Stage
  const isStageProgramme = (p: Programme) => {
    const typeStr = (p.type || '').toLowerCase();
    const venueStr = (p.venue || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    const subCatStr = (p.sub_category || '').toLowerCase();
    
    // Explicit type checks
    if (typeStr === 'stage') return true;
    if (typeStr === 'non_stage' || typeStr === 'off_stage') return false;

    // Venue / name clues
    if (venueStr.includes('stage') || venueStr.includes('auditorium') || venueStr.includes('hall')) return true;
    if (venueStr.includes('room') || venueStr.includes('gallery') || venueStr.includes('lab') || venueStr.includes('class') || venueStr.includes('exam')) return false;

    // Category / Subcategory clues
    if (subCatStr.includes('writing') || subCatStr.includes('art') || subCatStr.includes('calligraphy') || subCatStr.includes('essay')) return false;

    return true; // Default stage
  };

  // Helper to generate alphabetical Code Letters (A, B, C, ... Z, AA, AB...)
  const getCodeLetter = (index: number) => {
    let letter = '';
    let num = index;
    while (num >= 0) {
      letter = String.fromCharCode(65 + (num % 26)) + letter;
      num = Math.floor(num / 26) - 1;
    }
    return letter;
  };

  const filteredProgrammes = programmes.filter(p => {
    // 1. Category Filter
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const pCat = p.category.toUpperCase().replace(/\s+/g, '_');
      const sCat = selectedCategory.toUpperCase().replace(/\s+/g, '_');
      matchesCategory = (pCat === sCat || p.category === selectedCategory);
    }

    // 2. Stage / Non-Stage Filter
    let matchesType = true;
    if (selectedEventType === 'stage') {
      matchesType = isStageProgramme(p);
    } else if (selectedEventType === 'non_stage') {
      matchesType = !isStageProgramme(p);
    }

    return matchesCategory && matchesType;
  });

  const currentProgramme = programmes.find(p => p.id === selectedProgrammeId && filteredProgrammes.some(fp => fp.id === p.id)) 
    || filteredProgrammes[0];

  const mottoText = festSettings.festTheme || (festSettings as any).festMotto || festSettings.festThemeMl || 'കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ';
  const logoUrl = festSettings.festLogo || '/thanimiyyath-logo.svg';

  // Helper to calculate colSpan for empty messages
  let totalColumns = 5; // Sl, Total Marks, Grade, Position, Remarks
  if (showCodeLetter) totalColumns += 1;
  totalColumns += 1; // Chest No
  if (showStudentName) totalColumns += 1;
  if (showTeam) totalColumns += 1;

  // Helper to generate standalone printable HTML for one or multiple programmes
  const generatePrintableHTML = (targetProgrammes: Programme[]) => {
    const sheetsHTML = targetProgrammes.map((prg, index) => {
      const prgParticipants = participants.filter(p => p.programme_id === prg.id);
      const isStage = isStageProgramme(prg);
      
      // Build participant rows
      const rowsHTML = prgParticipants.length > 0 
        ? prgParticipants.map((p, idx) => {
            const stu = students.find(s => s.id === p.student_id);
            const team = teams.find(t => t.id === p.team);
            const codeLetter = getCodeLetter(idx);

            return `
              <tr style="page-break-inside: avoid;">
                <td style="border: 1.5px solid #0f172a; padding: 6px 4px; text-align: center; font-weight: bold; font-size: 12px; color: #0f172a;">${idx + 1}</td>
                ${showCodeLetter ? `
                  <td style="border: 1.5px solid #0f172a; padding: 6px 8px; font-weight: 900; font-size: 15px; color: #78350f; text-align: center; background-color: #ffffff; height: 34px; width: 65px;">
                    ${prefillLetters ? codeLetter : ''}
                  </td>
                ` : ''}
                <td style="border: 1.5px solid #0f172a; padding: 6px 8px; font-weight: 900; font-size: 15px; color: #0f172a; text-align: center; background-color: #f1f5f9; font-family: monospace;">
                  #${p.chest_number}
                </td>
                ${showStudentName ? `
                  <td style="border: 1.5px solid #0f172a; padding: 6px 10px; font-weight: 700; font-size: 12.5px; color: #0f172a;">
                    ${formatParticipantDisplayName(stu?.student_name, prg) || 'Registered Participant'}
                  </td>
                ` : ''}
                ${showTeam ? `
                  <td style="border: 1.5px solid #0f172a; padding: 6px 8px; font-size: 11.5px; text-align: center; font-weight: 800; color: #334155; text-transform: uppercase;">
                    ${team?.name || p.team.toUpperCase()}
                  </td>
                ` : ''}
                <td style="border: 1.5px solid #0f172a; padding: 6px; width: 85px; text-align: center; height: 34px;"></td>
                <td style="border: 1.5px solid #0f172a; padding: 6px; width: 70px; text-align: center; height: 34px;"></td>
                <td style="border: 1.5px solid #0f172a; padding: 6px; width: 70px; text-align: center; height: 34px;"></td>
                <td style="border: 1.5px solid #0f172a; padding: 6px; width: 130px; height: 34px;"></td>
              </tr>
            `;
          }).join('')
        : `
          <tr>
            <td colspan="${totalColumns}" style="border: 1.5px solid #0f172a; padding: 20px; text-align: center; color: #475569; font-style: italic; font-size: 12px;">
              No registered participants found for this programme in the system.
            </td>
          </tr>
        `;

      // Extra blank rows for walk-ins/judges notes
      const blankRowsNeeded = Math.max(0, 6 - prgParticipants.length);
      const blankRowsHTML = Array.from({ length: blankRowsNeeded }).map((_, i) => {
        const nextIdx = prgParticipants.length + i;
        const nextCode = getCodeLetter(nextIdx);
        return `
          <tr style="page-break-inside: avoid;">
            <td style="border: 1.5px solid #0f172a; padding: 6px 4px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600;">${nextIdx + 1}</td>
            ${showCodeLetter ? `
              <td style="border: 1.5px solid #0f172a; padding: 6px 8px; text-align: center; font-size: 13px; color: #92400e; font-weight: 800; height: 34px;">
                ${prefillLetters ? nextCode : ''}
              </td>
            ` : ''}
            <td style="border: 1.5px solid #0f172a; padding: 6px; height: 34px;"></td>
            ${showStudentName ? `<td style="border: 1.5px solid #0f172a; padding: 6px;"></td>` : ''}
            ${showTeam ? `<td style="border: 1.5px solid #0f172a; padding: 6px;"></td>` : ''}
            <td style="border: 1.5px solid #0f172a; padding: 6px;"></td>
            <td style="border: 1.5px solid #0f172a; padding: 6px;"></td>
            <td style="border: 1.5px solid #0f172a; padding: 6px;"></td>
            <td style="border: 1.5px solid #0f172a; padding: 6px;"></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="sheet-page" style="page-break-after: always; position: relative; min-height: 980px; padding: 22px 26px; background: #ffffff; color: #0f172a; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin-bottom: 20px;">
          
          <!-- Background Watermark Logo with forced print retention -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; opacity: 0.10; pointer-events: none; z-index: 0; overflow: hidden;">
            <img src="${logoUrl}" alt="Watermark" style="width: 480px; max-width: 80%; max-height: 80%; object-fit: contain; filter: grayscale(80%) contrast(150%);" />
          </div>

          <div style="position: relative; z-index: 1;">
            
            <!-- Header Section -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #b45309; padding-bottom: 10px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img src="${logoUrl}" alt="Logo" style="width: 64px; height: 64px; object-fit: contain; border-radius: 10px; padding: 4px; border: 1.5px solid #f59e0b; background: #fffbeb;" />
                <div>
                  <div style="font-size: 10.5px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; color: #b45309;">
                    ${festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                  </div>
                  <h1 style="margin: 2px 0 0 0; font-size: 23px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; line-height: 1.15;">
                    ${festSettings.festName} <span style="color: #d97706;">${festSettings.festYear || '2026'}</span>
                  </h1>
                  <div style="font-size: 11.5px; font-style: italic; color: #92400e; font-weight: 700; margin-top: 2px;">
                    "${mottoText}"
                  </div>
                </div>
              </div>
              
              <div style="text-align: right; background: #fef3c7; border: 2px solid #f59e0b; padding: 6px 12px; border-radius: 10px;">
                <div style="font-size: 9.5px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">
                  OFFICIAL EVALUATION
                </div>
                <div style="font-size: 16px; font-weight: 900; color: #78350f; margin-top: 1px;">
                  JUDGES SHEET
                </div>
                <div style="font-size: 9.5px; font-weight: 700; color: #b45309; margin-top: 1px;">
                  Sheet ${index + 1} of ${targetProgrammes.length} • Size: ${paperSize}
                </div>
              </div>
            </div>

            <!-- Programme Info Card -->
            <div style="display: grid; grid-template-columns: 2.2fr 1.1fr 1.3fr; gap: 8px; background: #f8fafc; border: 1.5px solid #0f172a; border-radius: 6px; padding: 7px 12px; margin-bottom: 12px; font-size: 11.5px;">
              <div>
                <span style="color: #475569; font-weight: 700; text-transform: uppercase; font-size: 9px; display: block; letter-spacing: 0.5px;">Programme Name:</span>
                <span style="font-size: 14.5px; font-weight: 900; color: #0f172a;">${prg.programme_name}</span>
                <span style="font-size: 12px; font-weight: 700; color: #b45309; margin-left: 6px; font-family: monospace;">(${prg.programme_code})</span>
              </div>
              <div>
                <span style="color: #475569; font-weight: 700; text-transform: uppercase; font-size: 9px; display: block; letter-spacing: 0.5px;">Category & Event Type:</span>
                <span style="font-size: 11.5px; font-weight: 800; color: #92400e; background: #fef3c7; border: 1px solid #f59e0b; padding: 1px 6px; border-radius: 4px; display: inline-block;">
                  ${prg.category}
                </span>
                <span style="font-size: 11px; font-weight: 800; color: #1e293b; margin-left: 4px; background: #e2e8f0; padding: 1px 5px; border-radius: 4px; display: inline-block;">
                  ${isStage ? 'STAGE' : 'NON-STAGE'}
                </span>
              </div>
              <div>
                <span style="color: #475569; font-weight: 700; text-transform: uppercase; font-size: 9px; display: block; letter-spacing: 0.5px;">Venue & Max Marks:</span>
                <span style="font-weight: 800; color: #0f172a; font-size: 11px;">${prg.venue || 'Main Venue'}</span>
                <div style="font-size: 11px; font-weight: 700; color: #b45309;">Max Marks: ${prg.maximum_marks || 100}</div>
              </div>
            </div>

            <!-- Participants Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 2px solid #0f172a;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px;">
                  <th style="border: 1.5px solid #334155; padding: 6px 4px; width: 34px; text-align: center;">Sl</th>
                  ${showCodeLetter ? `
                    <th style="border: 1.5px solid #d97706; padding: 6px 6px; width: 55px; text-align: center; background-color: #92400e; color: #fef3c7;">
                      Code Letter
                    </th>
                  ` : ''}
                  <th style="border: 1.5px solid #334155; padding: 6px 8px; width: 80px; text-align: center;">Chest No</th>
                  ${showStudentName ? `
                    <th style="border: 1.5px solid #334155; padding: 6px 10px; text-align: left;">Student Name</th>
                  ` : ''}
                  ${showTeam ? `
                    <th style="border: 1.5px solid #334155; padding: 6px 8px; width: 90px; text-align: center;">Team</th>
                  ` : ''}
                  <th style="border: 1.5px solid #334155; padding: 6px 6px; width: 85px; text-align: center;">Total Marks<br/><span style="font-size: 8.5px; font-weight: normal; opacity: 0.9;">(Max: ${prg.maximum_marks || 100})</span></th>
                  <th style="border: 1.5px solid #334155; padding: 6px 6px; width: 70px; text-align: center;">Grade<br/><span style="font-size: 8.5px; font-weight: normal; opacity: 0.9;">(A / B / C)</span></th>
                  <th style="border: 1.5px solid #334155; padding: 6px 6px; width: 70px; text-align: center;">Position<br/><span style="font-size: 8.5px; font-weight: normal; opacity: 0.9;">(1st/2nd/3rd)</span></th>
                  <th style="border: 1.5px solid #334155; padding: 6px 8px; width: 130px; text-align: left;">Judge Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
                ${blankRowsHTML}
              </tbody>
            </table>

            <!-- Evaluation Criteria Guidelines & Signatures -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 12px; font-size: 10.5px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
              <div style="border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 7px 10px; background: #f8fafc;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px; text-transform: uppercase; font-size: 9.5px;">Official Grading Rules:</div>
                <div style="color: #334155; line-height: 1.4; font-size: 10px;">
                  • <strong>Grade A</strong>: 70% & above (5 Points)<br/>
                  • <strong>Grade B</strong>: 60% – 69% (3 Points)<br/>
                  • <strong>Grade C</strong>: 50% – 59% (1 Point)
                </div>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: flex-end; gap: 12px; padding-left: 10px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 2px;">
                  <span style="font-weight: 800; color: #0f172a;">Judge Name:</span>
                  <span style="color: #64748b; font-weight: 600;">________________________________</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 2px;">
                  <span style="font-weight: 800; color: #0f172a;">Judge Signature:</span>
                  <span style="color: #64748b; font-weight: 600;">________________________________</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #475569;">
                  <span>Date: ___ / ___ / ${festSettings.festYear || '2026'}</span>
                  <span>ISIA Fest Control System</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Judge Sheets - ${festSettings.festName} (${targetProgrammes.length} Programmes)</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${paperSize} ${orientation};
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .sheet-page:last-child {
            page-break-after: auto !important;
          }
          @media print {
            body {
              background: #ffffff !important;
            }
          }
        </style>
      </head>
      <body>
        ${sheetsHTML}
      </body>
      </html>
    `;
  };

  // Robust printing execution handler that works seamlessly in iframe and popup
  const triggerPrint = (scope: 'single' | 'all_in_category') => {
    setIsPrinting(true);
    const targetProgrammes = scope === 'single'
      ? (currentProgramme ? [currentProgramme] : [])
      : filteredProgrammes;

    if (targetProgrammes.length === 0) {
      alert('No programmes available to print for the selected filter.');
      setIsPrinting(false);
      return;
    }

    setPrintStatusMessage(`Preparing ${targetProgrammes.length} evaluation sheet(s)...`);

    const htmlContent = generatePrintableHTML(targetProgrammes);

    // Try popup window approach first as it's the most reliable for multi-page batch prints
    try {
      const printWindow = window.open('', '_blank', 'width=950,height=900');
      if (printWindow && !printWindow.closed) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Give time for styles & images to settle before triggering print
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            console.warn('Popup print trigger caught:', e);
          }
          setIsPrinting(false);
          setPrintStatusMessage(null);
        }, 500);
        return;
      }
    } catch (popupErr) {
      console.warn('Popup window blocked or error, falling back to hidden iframe:', popupErr);
    }

    // Fallback to hidden iframe
    try {
      const existingIframe = document.getElementById('print-helper-frame');
      if (existingIframe) {
        document.body.removeChild(existingIframe);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'print-helper-frame';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1000px';
      iframe.style.height = '1000px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed, falling back to direct window.print', e);
            window.print();
          }
          setIsPrinting(false);
          setPrintStatusMessage(null);
        }, 600);
      } else {
        window.print();
        setIsPrinting(false);
        setPrintStatusMessage(null);
      }
    } catch (err) {
      console.error('Print trigger error:', err);
      window.print();
      setIsPrinting(false);
      setPrintStatusMessage(null);
    }
  };

  const openPrintWindow = (scope: 'single' | 'all_in_category') => {
    const targetProgrammes = scope === 'single'
      ? (currentProgramme ? [currentProgramme] : [])
      : filteredProgrammes;

    if (targetProgrammes.length === 0) {
      alert('No programmes to display in new window.');
      return;
    }

    const htmlContent = generatePrintableHTML(targetProgrammes);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      triggerPrint(scope);
    }
  };

  const currentProgrammeParticipants = currentProgramme 
    ? participants.filter(p => p.programme_id === currentProgramme.id) 
    : [];

  const isCurrentProgrammeStage = currentProgramme ? isStageProgramme(currentProgramme) : true;

  // Counts for Stage and Non-Stage
  const stageCount = programmes.filter(p => isStageProgramme(p)).length;
  const nonStageCount = programmes.filter(p => !isStageProgramme(p)).length;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 no-print">
        
        {/* Top Title & Batch Print Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <FileText size={18} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                Official Programme Judges Sheets
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select category and filter by <strong>Stage</strong> or <strong>Non-Stage</strong>. Print individual sheets or batch-print all matching programmes in one click.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => triggerPrint('single')}
              disabled={!currentProgramme || isPrinting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={15} />
              <span>{isPrinting ? 'Generating...' : 'Print Current Sheet'}</span>
            </button>

            <button
              onClick={() => triggerPrint('all_in_category')}
              disabled={filteredProgrammes.length === 0 || isPrinting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Batch print all judge sheets for currently filtered programmes"
            >
              <Layers size={15} />
              <span>Print All in Filter ({filteredProgrammes.length})</span>
            </button>

            <button
              onClick={() => openPrintWindow('all_in_category')}
              disabled={filteredProgrammes.length === 0}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="Open full printable batch in a new window"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">New Tab Batch</span>
            </button>
          </div>
        </div>

        {/* Print Status Feedback */}
        {printStatusMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Sparkles size={14} className="animate-spin text-amber-400" />
            <span>{printStatusMessage}</span>
          </div>
        )}

        {/* Stage / Non-Stage Filter Buttons */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Filter size={12} className="text-amber-400" />
            <span>Event Type Filter (Stage / Non-Stage)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedEventType('all')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
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

        {/* Paper Size, Orientation & Column Customization Toolbar */}
        <div className="pt-3 border-t border-slate-800 bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Paper Size & Layout */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <Maximize2 size={14} className="text-amber-400" />
                <span>Paper Size:</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                {(['A4', 'Legal', 'A3', 'Letter', 'A5'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPaperSize(size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      paperSize === size
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Orientation */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 ml-1">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Column Toggles */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sliders size={13} className="text-amber-400" />
                <span>Columns:</span>
              </span>

              <label className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl cursor-pointer hover:bg-amber-500/20 transition">
                <input
                  type="checkbox"
                  checked={showCodeLetter}
                  onChange={e => setShowCodeLetter(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Code Letter Column (For writing letters)</span>
              </label>

              {showCodeLetter && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg cursor-pointer hover:border-amber-500/50 transition">
                  <input
                    type="checkbox"
                    checked={prefillLetters}
                    onChange={e => setPrefillLetters(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Auto Pre-fill (A, B, C...)</span>
                </label>
              )}

              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl cursor-pointer hover:border-slate-500 transition">
                <input
                  type="checkbox"
                  checked={showStudentName}
                  onChange={e => setShowStudentName(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Student Name</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl cursor-pointer hover:border-slate-500 transition">
                <input
                  type="checkbox"
                  checked={showTeam}
                  onChange={e => setShowTeam(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Team Name</span>
              </label>
            </div>

          </div>
        </div>

        {/* Category & Programme Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
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

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <FileText size={12} className="text-amber-400" />
              <span>Select Programme to Preview ({filteredProgrammes.length} matching)</span>
            </label>
            <select
              value={currentProgramme?.id || ''}
              onChange={e => setSelectedProgrammeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              {filteredProgrammes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.programme_name} ({p.programme_code}) — {p.category} [{isStageProgramme(p) ? 'STAGE' : 'NON-STAGE'}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Preview of Judge Sheet (Screen + Print ready) */}
      {!currentProgramme ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400">
          No programmes found matching the selected category and event type filter.
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-300/40">
          
          <div 
            id="printable-sheet"
            className="bg-white text-slate-950 p-6 sm:p-10 relative min-h-[900px] select-none font-sans"
            style={{
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none opacity-10">
              <img
                src={logoUrl}
                alt="Fest Watermark"
                className="w-[480px] max-w-[80%] max-h-[80%] object-contain filter grayscale contrast-150"
                style={{
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
            </div>

            {/* Document Body */}
            <div className="relative z-10 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-amber-600 pb-4 gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border border-amber-400/50 p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                      {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {festSettings.festName} <span className="text-amber-600">{festSettings.festYear || '2026'}</span>
                    </h1>
                    <div className="text-xs sm:text-sm font-semibold italic text-amber-800">
                      "{mottoText}"
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right bg-amber-50 border border-amber-300 px-5 py-3 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">
                    OFFICIAL EVALUATION
                  </span>
                  <span className="text-lg font-black text-slate-900 block font-heading">
                    JUDGES SHEET
                  </span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900">
                    {isCurrentProgrammeStage ? 'STAGE EVENT' : 'NON-STAGE EVENT'}
                  </span>
                </div>
              </div>

              {/* Programme Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Programme:</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {currentProgramme.programme_name}
                  </span>
                  <span className="text-xs text-slate-500 ml-1 font-mono font-bold">({currentProgramme.programme_code})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Category & Type:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-xs">
                      {currentProgramme.category}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-xs">
                      {isCurrentProgrammeStage ? 'Stage' : 'Non-Stage'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Venue & Max Marks:</span>
                  <span className="font-bold text-slate-800 block">
                    {currentProgramme.venue || 'Main Venue'}
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    Maximum Marks: {currentProgramme.maximum_marks || 100}
                  </span>
                </div>
              </div>

              {/* Participants Scoring Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                      <th className="border border-slate-700 p-2 text-center w-10">Sl</th>
                      {showCodeLetter && (
                        <th className="border border-amber-600 bg-amber-900/90 text-amber-200 p-2 text-center w-20">
                          Code Letter
                        </th>
                      )}
                      <th className="border border-slate-700 p-2 text-center w-24">Chest No</th>
                      {showStudentName && (
                        <th className="border border-slate-700 p-2 text-left">Student Name</th>
                      )}
                      {showTeam && (
                        <th className="border border-slate-700 p-2 text-center w-28">Team</th>
                      )}
                      <th className="border border-slate-700 p-2 text-center w-24">
                        Marks <span className="text-[9px] font-normal block">({currentProgramme.maximum_marks || 100})</span>
                      </th>
                      <th className="border border-slate-700 p-2 text-center w-20">
                        Grade <span className="text-[9px] font-normal block">(A/B/C)</span>
                      </th>
                      <th className="border border-slate-700 p-2 text-center w-20">
                        Position <span className="text-[9px] font-normal block">(1/2/3)</span>
                      </th>
                      <th className="border border-slate-700 p-2 text-left w-36">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProgrammeParticipants.map((p, idx) => {
                      const student = students.find(s => s.id === p.student_id);
                      const team = teams.find(t => t.id === p.team);
                      const codeLetter = getCodeLetter(idx);

                      return (
                        <tr key={p.id} className="hover:bg-amber-50/50 transition">
                          <td className="border border-slate-800 p-2 text-center font-bold">{idx + 1}</td>
                          {showCodeLetter && (
                            <td className="border border-slate-800 p-2 text-center font-bold text-sm text-amber-950 bg-amber-50/20 font-sans h-10 w-16">
                              {prefillLetters ? codeLetter : ''}
                            </td>
                          )}
                          <td className="border border-slate-800 p-2 text-center font-extrabold text-sm text-slate-950 bg-slate-50 font-mono">
                            #{p.chest_number}
                          </td>
                          {showStudentName && (
                            <td className="border border-slate-800 p-2 font-semibold text-slate-900">
                              {formatParticipantDisplayName(student?.student_name, currentProgramme) || 'Registered Participant'}
                            </td>
                          )}
                          {showTeam && (
                            <td className="border border-slate-800 p-2 text-center font-bold text-slate-600 uppercase text-[11px]">
                              {team?.name || p.team}
                            </td>
                          )}
                          <td className="border border-slate-800 p-2 text-center h-10"></td>
                          <td className="border border-slate-800 p-2 text-center h-10"></td>
                          <td className="border border-slate-800 p-2 text-center h-10"></td>
                          <td className="border border-slate-800 p-2 text-left h-10"></td>
                        </tr>
                      );
                    })}

                    {currentProgrammeParticipants.length === 0 && (
                      <tr>
                        <td colSpan={totalColumns} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                          No registered participants yet for this programme. Use the Registration Portal to register students.
                        </td>
                      </tr>
                    )}

                    {/* Extra blank rows */}
                    {Array.from({ length: Math.max(0, 4 - currentProgrammeParticipants.length) }).map((_, i) => {
                      const nextIdx = currentProgrammeParticipants.length + i;
                      const nextCode = getCodeLetter(nextIdx);

                      return (
                        <tr key={`blank-${i}`}>
                          <td className="border border-slate-800 p-2 text-center text-slate-400 font-bold">{nextIdx + 1}</td>
                          {showCodeLetter && (
                            <td className="border border-slate-800 p-2 text-center text-amber-800 font-bold bg-amber-50/10 h-10 w-16">
                              {prefillLetters ? nextCode : ''}
                            </td>
                          )}
                          <td className="border border-slate-800 p-2 h-10"></td>
                          {showStudentName && <td className="border border-slate-800 p-2 h-10"></td>}
                          {showTeam && <td className="border border-slate-800 p-2 h-10"></td>}
                          <td className="border border-slate-800 p-2 h-10"></td>
                          <td className="border border-slate-800 p-2 h-10"></td>
                          <td className="border border-slate-800 p-2 h-10"></td>
                          <td className="border border-slate-800 p-2 h-10"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Grading System:</span>
                  Grade A: 70%+ | Grade B: 60%-69% | Grade C: 50%-59%
                </div>
                <div className="flex flex-col justify-end space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="font-bold text-slate-900">Judge Name & Signature:</span>
                    <span className="text-slate-400">________________________</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Date:</span>
                    <span className="text-slate-400">____ / ____ / ${festSettings.festYear || '2026'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

