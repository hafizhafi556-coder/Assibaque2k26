import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate a QR code image data URL for a certificate verification link or number
 */
export async function generateCertificateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

/**
 * Export a certificate HTML element to high-resolution PNG
 */
export async function downloadCertificatePng(element: HTMLElement, filename = 'certificate.png'): Promise<string> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    link.click();

    return dataUrl;
  } catch (error) {
    console.error('Error generating PNG certificate:', error);
    throw error;
  }
}

/**
 * Export a certificate HTML element to standard A4 Landscape PDF
 */
export async function downloadCertificatePdf(element: HTMLElement, filename = 'certificate.pdf'): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    // A4 Landscape: 297mm x 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF certificate:', error);
    throw error;
  }
}

/**
 * Print a certificate element directly
 */
export function printCertificateElement(): void {
  window.print();
}
