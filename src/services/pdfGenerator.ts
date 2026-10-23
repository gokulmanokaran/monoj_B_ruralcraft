import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CustomsDocument, Order } from '../types';

export function createCustomsDocFromOrder(order: Order): CustomsDocument {
  const invNumber = `INV-${order.order_number.replace(/[^0-9]/g, '').slice(-6) || '000001'}`;
  const totalWeight = (order.items || []).reduce(
    (acc, i) => acc + (Number(i.weight_kg) || 0.5) * (i.quantity || 1),
    0
  );

  return {
    id: `cust-${order.id}`,
    order_id: order.id,
    order_number: order.order_number,
    invoice_number: invNumber,
    invoice_date: new Date(order.created_at || Date.now()).toISOString().split('T')[0],
    exporter: {
      name: 'RuralCraft Global Consortium',
      organization: 'RuralCraft Global Export Hub',
      address: 'Artisan Enclave, Sector 4, New Delhi 110001, India',
      iec_code: '0519048821',
      gstin: '07AAAAA0000A1Z5',
      country: 'India',
      contact: '+91 80 4200 8888'
    },
    buyer: {
      name: order.shipping_address?.full_name || order.customer_name || 'Customer',
      address: order.shipping_address?.address || 'Destination Address',
      city: order.shipping_address?.city || '',
      state: order.shipping_address?.state || '',
      country: order.shipping_address?.country || 'International',
      postal_code: order.shipping_address?.postal_code || '',
      email: order.shipping_address?.email || order.customer_email || '',
      phone: order.shipping_address?.phone || order.customer_phone || ''
    },
    country_of_origin: 'India',
    destination_country: order.shipping_address?.country || 'International',
    items: (order.items || []).map(item => ({
      product_name: item.product_name,
      hs_code: item.suggested_hs_code || '4602.11',
      quantity: item.quantity,
      unit_price_inr: Number(item.price_inr) || 0,
      total_price_inr: (Number(item.price_inr) || 0) * (item.quantity || 1),
      unit_price_converted: Number(item.converted_price) || 0,
      total_price_converted: (Number(item.converted_price) || 0) * (item.quantity || 1),
      weight_kg: (Number(item.weight_kg) || 0.5) * (item.quantity || 1)
    })),
    currency: order.selected_currency || 'USD',
    exchange_rate: Number(order.exchange_rate) || 1.0,
    total_value_inr: Number(order.total_inr) || 0,
    total_value_converted: Number(order.converted_total) || 0,
    total_weight_kg: Number(totalWeight.toFixed(3)),
    declaration: 'We declare that this invoice shows the actual price of the handcrafted goods described and that all particulars are true and correct.',
    disclaimer: 'Suggested HS Code shown for international customs classification. Verify before export clearance.',
    verification_status: 'Suggested',
    created_at: new Date(order.created_at || Date.now()).toISOString()
  };
}

export function generateCustomsPDF(doc: CustomsDocument, order?: Order) {
  // Support both ES module and default export variations of jsPDF
  const DocConstructor = (jsPDF as any).jsPDF || jsPDF;
  const pdf = new DocConstructor('p', 'mm', 'a4');
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

  // Safe resolution of data
  const orderNumber = (doc as any).order_number || order?.order_number || (doc as any).order_id || 'RCG-ORDER';
  const invoiceNumber = doc.invoice_number || `INV-${orderNumber.replace(/[^0-9]/g, '').slice(-6) || '000000'}`;
  const invoiceDate = doc.invoice_date || new Date().toISOString().split('T')[0];
  const originCountry = doc.country_of_origin || 'India';
  const destinationCountry = doc.destination_country || order?.shipping_address?.country || 'International';

  // Invoice & Order meta row
  let y = 42;
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Invoice Number:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(invoiceNumber), 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Order ID:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(orderNumber), 130, y);

  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(invoiceDate), 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Terms of Sale:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DAP (Delivered at Place)', 135, y);

  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Origin Country:', 14, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(originCountry), 44, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Destination:', 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(destinationCountry), 135, y);

  y += 4;
  pdf.setDrawColor(220, 220, 215);
  pdf.line(14, y, pageWidth - 14, y);

  // Safe Exporter and Buyer objects (handles both object and JSON string)
  const exporter = typeof doc.exporter === 'string' ? JSON.parse(doc.exporter) : (doc.exporter || {});
  const buyer = typeof doc.buyer === 'string' ? JSON.parse(doc.buyer) : (doc.buyer || {});

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
  pdf.text(String(exporter.name || 'RuralCraft Artisan Collective'), 18, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(exporter.organization || 'Rural Artisan Export Consortium'), 18, y + 17);
  pdf.text(String(exporter.address || 'Artisan Enclave, New Delhi, India'), 18, y + 22);
  pdf.text(`IEC Code: ${exporter.iec_code || '0519048821'}  |  GSTIN: ${exporter.gstin || '07AAAAA0000A1Z5'}`, 18, y + 27);
  pdf.text(`Country: India  |  Contact: ${exporter.contact || '+91 80 4200 8888'}`, 18, y + 32);

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
  pdf.text(String(buyer.name || order?.customer_name || 'Valued Customer'), col2X + 4, y + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(buyer.address || order?.shipping_address?.address || 'Destination Address'), col2X + 4, y + 17);
  pdf.text(`${buyer.city || order?.shipping_address?.city || ''}, ${buyer.state || order?.shipping_address?.state || ''} ${buyer.postal_code || order?.shipping_address?.postal_code || ''}`, col2X + 4, y + 22);
  pdf.text(`Country: ${buyer.country || destinationCountry}`, col2X + 4, y + 27);
  pdf.text(`Phone: ${buyer.phone || order?.customer_phone || 'N/A'}  |  Email: ${buyer.email || order?.customer_email || 'N/A'}`, col2X + 4, y + 32);

  // Parse items safely
  let rawItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || []);
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    if (order?.items && order.items.length > 0) {
      rawItems = order.items.map(i => ({
        product_name: i.product_name,
        hs_code: i.suggested_hs_code || '4602.11',
        quantity: i.quantity || 1,
        weight_kg: i.weight_kg || 0.5,
        unit_price_inr: i.price_inr || 0,
        unit_price_converted: i.converted_price || 0,
        total_price_converted: (i.converted_price || 0) * (i.quantity || 1)
      }));
    } else {
      rawItems = [];
    }
  }

  const currency = doc.currency || order?.selected_currency || 'USD';

  // Table of Items
  y += 46;
  const tableRows = rawItems.map((item: any, idx: number) => [
    (idx + 1).toString(),
    String(item.product_name || 'Artisan Craft Item'),
    String(item.hs_code || '4602.11'),
    String(item.quantity || 1),
    `${(Number(item.weight_kg) || 0.5).toFixed(2)} kg`,
    `INR ${Number(item.unit_price_inr || 0).toLocaleString('en-IN')}`,
    `${currency} ${Number(item.unit_price_converted || 0).toFixed(2)}`,
    `${currency} ${Number(item.total_price_converted || item.unit_price_converted * item.quantity || 0).toFixed(2)}`
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
      `Unit (${currency})`,
      `Total (${currency})`
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
  const finalY = ((pdf as any).lastAutoTable?.finalY || y + 40) + 6;

  // Safe numerical totals
  const totalValueInr = Number(doc.total_value_inr) || Number(order?.total_inr) || 0;
  const exchangeRate = Number(doc.exchange_rate) || Number(order?.exchange_rate) || 1.0;
  const totalWeightKg = Number(doc.total_weight_kg) || 0.5;
  const totalValueConverted = Number(doc.total_value_converted) || Number(order?.converted_total) || 0;

  // Summary and Weight Box
  pdf.setFillColor(250, 250, 247);
  pdf.rect(pageWidth - 85, finalY, 71, 30, 'F');
  pdf.setDrawColor(200, 200, 195);
  pdf.rect(pageWidth - 85, finalY, 71, 30, 'S');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Subtotal (INR):', pageWidth - 80, finalY + 6);
  pdf.text(`INR ${totalValueInr.toLocaleString('en-IN')}`, pageWidth - 18, finalY + 6, { align: 'right' });

  pdf.text(`Exchange Rate (1 INR):`, pageWidth - 80, finalY + 11);
  pdf.text(`${exchangeRate.toFixed(5)} ${currency}`, pageWidth - 18, finalY + 11, { align: 'right' });

  pdf.text('Total Net Weight:', pageWidth - 80, finalY + 16);
  pdf.text(`${totalWeightKg.toFixed(2)} kg`, pageWidth - 18, finalY + 16, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  pdf.text(`Total Customs Value:`, pageWidth - 80, finalY + 24);
  pdf.text(`${currency} ${totalValueConverted.toFixed(2)}`, pageWidth - 18, finalY + 24, { align: 'right' });

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
  const statusStr = String(doc.verification_status || 'Suggested').replace('_', ' ');
  const statusColor = doc.verification_status === 'Admin_Verified' ? [45, 106, 79] : [188, 108, 37];
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(`Classification: ${statusStr}`, stampX + 4, stampY + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.text(`Verified By: ${doc.verified_by || 'System HS Suggestion Engine'}`, stampX + 4, stampY + 17);
  pdf.text(`Timestamp: ${doc.verified_at || doc.created_at || new Date().toISOString()}`, stampX + 4, stampY + 22);
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
  pdf.text('IMPORTANT CLASSIFICATION NOTICE:', 17, discY + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  pdf.text(
    'The HS codes shown are system suggestions generated based on artisan product categories and keywords. HS codes must be verified with an authorized customs broker prior to international shipping.',
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
  pdf.save(`Customs_Invoice_${invoiceNumber}.pdf`);
}
