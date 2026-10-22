import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CustomsDocument, Order } from '../types';

export function generateCustomsPDF(doc: CustomsDocument, order?: Order) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Colors
  const forestGreen = [20, 56, 38];
  const goldSand = [188, 108, 37];
  const darkCharcoal = [31, 36, 33];
  const lightGray = [240, 240, 235];

  // Header background banner
  pdf.setFillColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.rect(0, 0, pageWidth, 32, 'F');

  // Brand title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('RURALCRAFT GLOBAL', 14, 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Rural Artisan International E-Commerce & Customs Platform', 14, 22);
  pdf.text('Direct from Village Workshops of India to Global Homes', 14, 27);

  // Document Title badge
  pdf.setFillColor(goldSand[0], goldSand[1], goldSand[2]);
  pdf.roundedRect(pageWidth - 75, 8, 63, 16, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('COMMERCIAL INVOICE', pageWidth - 70, 15);
  pdf.setFontSize(7.5);
  pdf.text('& CUSTOMS DECLARATION', pageWidth - 67, 20);

  // Invoice & Order meta row
  let y = 42;
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Invoice Number:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.invoice_number, 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Order ID:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.order_number, 130, y);

  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.invoice_date || new Date().toISOString().split('T')[0], 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Terms of Sale:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DAP (Delivered at Place)', 135, y);

  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Origin Country:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.country_of_origin || 'India', 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Destination:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.destination_country || 'International', 135, y);

  y += 4;
  pdf.setDrawColor(220, 220, 215);
  pdf.line(14, y, pageWidth - 14, y);

  // Two columns: Exporter and Buyer / Consignee
  y += 6;
  const colWidth = (pageWidth - 34) / 2;

  // Exporter Box
  pdf.setFillColor(250, 250, 247);
  pdf.rect(14, y, colWidth, 40, 'F');
  pdf.setDrawColor(200, 200, 195);
  pdf.rect(14, y, colWidth, 40, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text('EXPORTER (CONSIGNOR):', 18, y + 6);

  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.exporter.name || 'RuralCraft Artisan Collective', 18, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.exporter.organization || 'Rural Artisan Export Consortium', 18, y + 17);
  pdf.text(doc.exporter.address || 'Assam & Bengal Rural Workshops, India', 18, y + 22);
  pdf.text(`IEC Code: ${doc.exporter.iec_code || '0518099341'}  |  GSTIN: ${doc.exporter.gstin || '18AAACL9012M1Z2'}`, 18, y + 27);
  pdf.text(`Country: India  |  Contact: ${doc.exporter.contact || 'customs@ruralcraft.global'}`, 18, y + 32);

  // Buyer / Consignee Box
  const col2X = 14 + colWidth + 6;
  pdf.setFillColor(250, 250, 247);
  pdf.rect(col2X, y, colWidth, 40, 'F');
  pdf.setDrawColor(200, 200, 195);
  pdf.rect(col2X, y, colWidth, 40, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text('CONSIGNEE (BUYER):', col2X + 4, y + 6);

  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.buyer.name || 'Valued International Customer', col2X + 4, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.buyer.address || 'Destination Address', col2X + 4, y + 17);
  pdf.text(`${doc.buyer.city || ''}, ${doc.buyer.state || ''} ${doc.buyer.postal_code || ''}`, col2X + 4, y + 22);
  pdf.text(`Country: ${doc.buyer.country || doc.destination_country}`, col2X + 4, y + 27);
  pdf.text(`Phone: ${doc.buyer.phone || 'N/A'}  |  Email: ${doc.buyer.email || 'N/A'}`, col2X + 4, y + 32);

  // Table of Items
  y += 46;
  const tableRows = doc.items.map((item, idx) => [
    (idx + 1).toString(),
    item.product_name,
    item.hs_code || '4602.11',
    item.quantity.toString(),
    `${(item.weight_kg || 0.5).toFixed(2)} kg`,
    `INR ${item.unit_price_inr.toLocaleString()}`,
    `${doc.currency} ${item.unit_price_converted.toFixed(2)}`,
    `${doc.currency} ${item.total_price_converted.toFixed(2)}`
  ]);

  autoTable(pdf, {
    startY: y,
    head: [[
      '#',
      'Handcrafted Product Description',
      'Suggested HS Code',
      'Qty',
      'Net Wt',
      'Unit (INR)',
      `Unit (${doc.currency})`,
      `Total (${doc.currency})`
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 56, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [31, 36, 33],
      lineColor: [220, 220, 215]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 26, fontStyle: 'bold', halign: 'center', textColor: [188, 108, 37] },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // Calculate table end Y
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = pdf.lastAutoTable.finalY + 6;

  // Summary and Weight Box
  pdf.setFillColor(250, 250, 247);
  pdf.rect(pageWidth - 85, finalY, 71, 30, 'F');
  pdf.setDrawColor(200, 200, 195);
  pdf.rect(pageWidth - 85, finalY, 71, 30, 'S');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Subtotal (INR):', pageWidth - 80, finalY + 6);
  pdf.text(`INR ${doc.total_value_inr.toLocaleString()}`, pageWidth - 18, finalY + 6, { align: 'right' });

  pdf.text(`Exchange Rate (1 INR):`, pageWidth - 80, finalY + 11);
  pdf.text(`${doc.exchange_rate.toFixed(5)} ${doc.currency}`, pageWidth - 18, finalY + 11, { align: 'right' });

  pdf.text('Total Net Weight:', pageWidth - 80, finalY + 16);
  pdf.text(`${doc.total_weight_kg.toFixed(2)} kg`, pageWidth - 18, finalY + 16, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text(`Total Customs Value:`, pageWidth - 80, finalY + 24);
  pdf.text(`${doc.currency} ${doc.total_value_converted.toFixed(2)}`, pageWidth - 18, finalY + 24, { align: 'right' });

  // Verification & Status stamp
  const stampX = 14;
  const stampY = finalY;
  pdf.setDrawColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.setLineWidth(0.5);
  pdf.rect(stampX, stampY, 75, 30);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text('CUSTOMS CLASSIFICATION STATUS:', stampX + 4, stampY + 6);

  pdf.setFontSize(8);
  const statusColor = doc.verification_status === 'Admin_Verified' ? [45, 106, 79] : [188, 108, 37];
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(`Classification: ${doc.verification_status.replace('_', ' ')}`, stampX + 4, stampY + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.text(`Verified By: ${doc.verified_by || 'System HS Suggestion Engine'}`, stampX + 4, stampY + 17);
  pdf.text(`Timestamp: ${doc.verified_at || doc.created_at}`, stampX + 4, stampY + 22);
  pdf.text('Export Clearance Route: Standard Artisan Air Cargo', stampX + 4, stampY + 27);

  // Exporter Declaration
  const declY = finalY + 36;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text('EXPORTER CERTIFICATION & DECLARATION:', 14, declY);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7.5);
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  const declText = doc.declaration || 'I hereby certify that the information provided in this document is accurate to the best of my knowledge and that the goods are authentic handmade crafts of Indian rural origin.';
  pdf.text(declText, 14, declY + 4, { maxWidth: pageWidth - 28 });

  // Prominent Disclaimer Box
  const discY = declY + 13;
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(14, discY, pageWidth - 28, 12, 'F');
  pdf.setDrawColor(goldSand[0], goldSand[1], goldSand[2]);
  pdf.rect(14, discY, pageWidth - 28, 12, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(goldSand[0], goldSand[1], goldSand[2]);
  pdf.text('IMPORTANT CLASSIFICATION NOTICE (DEMO / STUDENT PLATFORM):', 17, discY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.text(
    'The HS codes shown are system suggestions generated based on artisan product categories and keywords. This document is part of a student project demo. HS codes must be verified with an authorized customs broker prior to international shipping.',
    17,
    discY + 8,
    { maxWidth: pageWidth - 34 }
  );

  // Signatures row
  const sigY = discY + 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Authorized Exporter Signatory', 14, sigY + 6);
  pdf.line(14, sigY + 4, 75, sigY + 4);

  pdf.text('Customs Clearance Officer / Verification Agent', pageWidth - 80, sigY + 6);
  pdf.line(pageWidth - 80, sigY + 4, pageWidth - 14, sigY + 4);

  // Save / Trigger Download
  pdf.save(`Customs_Invoice_${doc.invoice_number}.pdf`);
}
