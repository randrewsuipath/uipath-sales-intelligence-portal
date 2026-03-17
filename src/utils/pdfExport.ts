import jsPDF from 'jspdf';
import type { ProcessedAccount } from './riskScoring';
export async function exportAccountPDF(account: ProcessedAccount): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Summary Report', margin, yPos);
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;
  // Account Info
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(account.accountName, margin, yPos);
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Region: ${account.region}`, margin, yPos);
  yPos += 5;
  pdf.text(`Risk Level: ${account.riskLevel} (Score: ${account.riskScore}/100)`, margin, yPos);
  yPos += 10;
  // Metrics Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Key Metrics', margin, yPos);
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const metrics = [
    `Annual Recurring Revenue: $${(account.arr / 1000).toFixed(0)}K`,
    `Average Utilisation: ${account.avgUtilisation.toFixed(1)}%`,
    `Robot Utilisation: ${account.robotUtilisationPct.toFixed(1)}%`,
    `AI Utilisation: ${account.aiUtilisationPct.toFixed(1)}%`,
    `Agentic Utilisation: ${account.agenticUtilisationPct.toFixed(1)}%`,
  ];
  metrics.forEach((metric) => {
    pdf.text(metric, margin + 5, yPos);
    yPos += 5;
  });
  yPos += 5;
  // Ownership Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ownership Team', margin, yPos);
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const ownership = [
    `Account Director: ${account.accountDirector}`,
    `Technical Account Manager: ${account.tam}`,
    `Customer Success Manager: ${account.csm}`,
  ];
  ownership.forEach((owner) => {
    pdf.text(owner, margin + 5, yPos);
    yPos += 5;
  });
  yPos += 5;
  // Licence Info
  if (account.licenceExpiryDate) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Licence Information', margin, yPos);
    yPos += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const expiryDate = new Date(account.licenceExpiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    pdf.text(`Expiry Date: ${expiryDate.toLocaleDateString()}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Days Until Expiry: ${daysUntilExpiry}`, margin + 5, yPos);
    yPos += 10;
  }
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Powered by UiPath', margin, pageHeight - 10);
  // Save
  pdf.save(`${account.accountName.replace(/\s+/g, '_')}_Summary.pdf`);
}