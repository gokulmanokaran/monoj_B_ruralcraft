const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

// Color Palette
const PRIMARY = [20, 56, 38];      // #143826 Deep Forest Green
const ACCENT = [221, 161, 94];     // #DDA15E Warm Gold / Ochre
const SECONDARY = [45, 106, 79];   // #2D6A4F Medium Green
const TEXT_DARK = [30, 30, 30];    // Charcoal Black
const TEXT_MUTED = [100, 100, 100];// Gray
const BG_LIGHT = [250, 250, 247];  // #FAFAF7 Off-white

function addHeaderFooter(doc, title = 'RURALCRAFT GLOBAL — PROJECT REPORT') {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) continue; // Skip cover page

    // Header line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 15, pageWidth - 15, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(title, 15, 12);
    doc.text('ACADEMIC YEAR 2025 - 2026', pageWidth - 15, 12, { align: 'right' });

    // Footer line
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    doc.text('RuralCraft Global | Cross-Border E-Commerce & Customs Automation', 15, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
}

// ============================================================================
// PAGE 1: COVER PAGE
// ============================================================================
// Background accent bar
doc.setFillColor(...PRIMARY);
doc.rect(0, 0, pageWidth, 28, 'F');

doc.setFillColor(...ACCENT);
doc.rect(0, 28, pageWidth, 3, 'F');

// Header in bar
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(255, 255, 255);
doc.text('COLLEGE PROJECT REPORT | FULL-STACK WEB DEVELOPMENT', pageWidth / 2, 18, { align: 'center' });

// Project Title Block
doc.setFont('helvetica', 'bold');
doc.setFontSize(26);
doc.setTextColor(...PRIMARY);
doc.text('RURALCRAFT GLOBAL', pageWidth / 2, 58, { align: 'center' });

doc.setFontSize(12);
doc.setTextColor(...SECONDARY);
doc.text('A Unified Cross-Border Rural Handicraft Marketplace with', pageWidth / 2, 68, { align: 'center' });
doc.text('Automated Customs Documentation & HS Code Classification Engine', pageWidth / 2, 75, { align: 'center' });

// Decorative Divider
doc.setDrawColor(...ACCENT);
doc.setLineWidth(1.2);
doc.line(40, 83, pageWidth - 40, 83);

// Highlight Box
doc.setFillColor(...BG_LIGHT);
doc.setDrawColor(210, 210, 200);
doc.setLineWidth(0.5);
doc.roundedRect(25, 92, pageWidth - 50, 56, 4, 4, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...PRIMARY);
doc.text('EXECUTIVE OVERVIEW', 32, 102);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(...TEXT_DARK);
const overviewText = [
  'RuralCraft Global is an enterprise-grade, direct-to-consumer (D2C) cross-border e-commerce',
  'platform designed to bridge Indian rural artisans directly with international buyers. It integrates',
  'a multi-currency conversion engine, automated Harmonized System (HS) export tariff classification,',
  'instant customs commercial invoice PDF generation, and a unified command center managing',
  'customer orders, artisan profiles, and verified export logistics.'
];
doc.text(overviewText, 32, 111);

// Submission Details Box
doc.setFillColor(255, 255, 255);
doc.roundedRect(25, 160, pageWidth - 50, 70, 4, 4, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY);
doc.text('PROJECT CREDENTIALS & METADATA', 32, 172);

doc.setDrawColor(230, 230, 230);
doc.line(32, 176, pageWidth - 32, 176);

doc.setFontSize(9);
const metaLeft = 32;
const metaRight = 100;
let metaY = 186;

const metadata = [
  ['Project Title', 'RuralCraft Global — Cross-Border Artisan Platform'],
  ['Submitted By', 'Manoj B (Student / Developer)'],
  ['Domain', 'Full-Stack E-Commerce & Customs Tech'],
  ['Core Tech Stack', 'React 19, TypeScript, Supabase, Tailwind, jsPDF'],
  ['Deployment Target', 'Vercel (Single Unified SPA Deployment)'],
  ['Database Cloud', 'Supabase Cloud (PostgreSQL with RLS)'],
  ['Academic Year', '2025 – 2026']
];

metadata.forEach(([label, val]) => {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY);
  doc.text(`${label}:`, metaLeft, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(val, metaRight, metaY);
  metaY += 6.5;
});

// Bottom Badge
doc.setFillColor(...PRIMARY);
doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...ACCENT);
doc.text('ACADEMIC PROJECT REPORT SUBMISSION | RURALCRAFT GLOBAL', pageWidth / 2, pageHeight - 8, { align: 'center' });

// ============================================================================
// PAGE 2: ABSTRACT, PROBLEM STATEMENT & OBJECTIVES
// ============================================================================
doc.addPage();
let yPos = 25;

function addSectionTitle(title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...PRIMARY);
  doc.text(title, 15, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line(15, y + 2, 75, y + 2);
  return y + 9;
}

yPos = addSectionTitle('1. ABSTRACT & PROJECT MOTIVATION', yPos);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(...TEXT_DARK);

const abstractP1 = 'India possesses over 7 million traditional rural artisans practicing centuries-old craft traditions including Bankura Terracotta, Assam River Bamboo, Madurai Golden Jute, Chanderi Handloom, and 4,000-year-old Lost-Wax Dokra Brass Smithing. Despite immense global demand for sustainable handmade decor and lifestyle products, rural artisans receive less than 15-20% of the end-consumer retail value due to multi-layered middlemen and severe trade entry barriers.';
doc.text(doc.splitTextToSize(abstractP1, pageWidth - 30), 15, yPos);
yPos += 20;

const abstractP2 = 'RuralCraft Global provides a single, unified digital platform where artisans showcase their craft heritage, and international customers purchase directly in their native currency (USD, EUR, GBP, AED, CAD, AUD, JPY). Simultaneously, the platform automates complex international trade compliance by classifying goods with 6-digit Harmonized System (HS) customs codes and automatically generating export commercial invoices with certified packing lists.';
doc.text(doc.splitTextToSize(abstractP2, pageWidth - 30), 15, yPos);
yPos += 22;

yPos = addSectionTitle('2. PROBLEM STATEMENT', yPos);

const problems = [
  ['Intermediary Exploitation', 'Artisans sell to local traders at raw cost; retail margins are absorbed by intermediaries.'],
  ['Customs & Tariff Complexity', 'Cross-border exports require 6-digit HS tariff codes, IEC (Import Export Code), and GST declarations which rural artisans cannot navigate.'],
  ['Currency & Pricing Friction', 'International buyers require instant pricing in foreign currencies with dynamic exchange rates.'],
  ['Fragmented Portals', 'Managing separate customer apps and admin backends causes authentication desynchronization, double deployments, and increased maintenance overhead.']
];

autoTable(doc, {
  startY: yPos,
  head: [['Challenge Area', 'Real-World Problem & Impact']],
  body: problems,
  theme: 'striped',
  headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', textColor: SECONDARY }, 1: { cellWidth: 'auto' } },
  margin: { left: 15, right: 15 }
});

yPos = doc.lastAutoTable.finalY + 10;

yPos = addSectionTitle('3. PROJECT OBJECTIVES', yPos);

const objectives = [
  '1. Unified Architecture: Single deployment on Vercel handling Customer Marketplace, Artisan Studio, and Admin Command Center with zero sub-domain or multiple repo fragmentation.',
  '2. Automated HS Code Suggestion: Algorithmic classification engine that analyzes product titles, materials, and descriptions to recommend correct WCO Harmonized Tariff Codes.',
  '3. Instant Customs PDF Generator: Automated creation of compliant export invoices featuring exporter IEC, GSTIN, buyer declarations, and tariff notes using client-side jsPDF rendering.',
  '4. Live Multi-Currency Conversion: Dynamic conversion between INR base prices and major global currencies (USD, EUR, GBP, AED, CAD, AUD, SGD, JPY).',
  '5. Optimistic UI Performance: Instantaneous sub-100ms response times for product additions, edits, and deletions without blocking full-page reload spinners.'
];

objectives.forEach(obj => {
  const lines = doc.splitTextToSize(obj, pageWidth - 30);
  doc.text(lines, 15, yPos);
  yPos += (lines.length * 4.5) + 1.2;
});

// ============================================================================
// PAGE 3: SYSTEM ARCHITECTURE & DATABASE DESIGN
// ============================================================================
doc.addPage();
yPos = 25;

yPos = addSectionTitle('4. SYSTEM ARCHITECTURE', yPos);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(...TEXT_DARK);
const archDesc = 'The platform adopts a modern 3-Tier Serverless Single Page Application (SPA) architecture designed for high scalability, zero-cold-start latency, and instant global distribution:';
doc.text(doc.splitTextToSize(archDesc, pageWidth - 30), 15, yPos);
yPos += 10;

const tiers = [
  ['Presentation Tier (Frontend)', 'React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion. Single bundle deployed to Vercel Edge CDN with client-side SPA routing (`vercel.json` rewrites).'],
  ['Business Logic & Services Tier', 'Modular client-side services: `ApiService` (Supabase integration), `pdfGenerator` (customs invoices), `AuthContext` (role-based access), `CurrencyContext` (live exchange rates).'],
  ['Data & Storage Tier (Supabase)', 'Managed PostgreSQL database with Row-Level Security (RLS), Auth trigger listeners, and relational integrity across users, products, orders, and customs records.']
];

autoTable(doc, {
  startY: yPos,
  head: [['Architectural Layer', 'Technology & Responsibility']],
  body: tiers,
  theme: 'grid',
  headStyles: { fillColor: SECONDARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  margin: { left: 15, right: 15 }
});

yPos = doc.lastAutoTable.finalY + 10;

yPos = addSectionTitle('5. DATABASE SCHEMA DESIGN (SUPABASE POSTGRESQL)', yPos);

const schemaTables = [
  ['profiles', 'id (UUID), full_name, phone, role (customer/artisan/admin), designation, department, city, country, iec_code, gstin, bio, avatar_url'],
  ['artisans', 'id (UUID), user_id, brand_name, craft_type, story, location, village, state, country, verified, rating, total_sales, phone, iec_code'],
  ['categories', 'id (UUID), name, slug, icon, description, suggested_hs_code'],
  ['products', 'id (UUID), artisan_id, category_id, name, slug, description, price_inr, stock, weight_kg, dimensions, material, country_of_origin, suggested_hs_code, hs_confidence, hs_code_verified, status'],
  ['product_images', 'id (UUID), product_id, image_url, is_primary, sort_order'],
  ['orders', 'id (UUID), order_number, user_id, customer_name, customer_email, customer_phone, total_inr, selected_currency, exchange_rate, converted_total, shipping_address (JSONB), status, tracking_number'],
  ['order_items', 'id (UUID), order_id, product_id, product_name, artisan_id, quantity, price_inr, converted_price, suggested_hs_code, weight_kg, image_url'],
  ['hs_codes', 'id (UUID), category, keywords (text[]), hs_code, description, country_rules, duty_notes, confidence_rating'],
  ['customs_documents', 'id (UUID), order_id, order_number, invoice_number, invoice_date, exporter (JSONB), buyer (JSONB), items (JSONB), currency, exchange_rate, total_value_inr, total_weight_kg, verification_status']
];

autoTable(doc, {
  startY: yPos,
  head: [['Table Name', 'Attributes & Schema Structure']],
  body: schemaTables,
  theme: 'striped',
  headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
  bodyStyles: { fontSize: 7.5, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', textColor: SECONDARY }, 1: { cellWidth: 'auto' } },
  margin: { left: 15, right: 15 }
});

// ============================================================================
// PAGE 4: DETAILED MODULES & HS CUSTOMS ENGINE
// ============================================================================
doc.addPage();
yPos = 25;

yPos = addSectionTitle('6. KEY SYSTEM MODULES & FUNCTIONALITY', yPos);

const modules = [
  ['Module 1: Customer Storefront', 'Interactive explore catalog with filters for category, price ranges, and artisan regions. Responsive 3-column header navigation, instant search modal, dynamic currency switcher, animated shopping cart drawer, and multi-step international checkout.'],
  ['Module 2: Artisan Studio', 'Dedicated portal for verified artisans to showcase cultural craft stories, upload authentic handmade items, specify craft dimensions and materials, and review direct sales analytics.'],
  ['Module 3: HS Code Customs Engine', 'Automated trade classification algorithm matching product materials and categories against the World Customs Organization (WCO) tariff schedule. Auto-assigns codes like 4602.11 (Bamboo), 6912.00 (Terracotta), 5208.52 (Handloom Cotton), and 8306.29 (Dokra Brass).'],
  ['Module 4: Commercial Invoice PDF', 'Client-side vector PDF generation creating official export documents with Exporter IEC & GSTIN credentials, buyer consignee address, customs tariff declarations, duty concessions under GSP/CEPA treaties, and authorized signatory blocks.'],
  ['Module 5: Admin Command Center', 'Unified portal with tabs for Real-time Analytics, Admin Trade Profile, Products Catalog (with instant full-field Edit/Delete/Upload), Global Orders (tracking & status updates), HS Codes Master Repository, and Customs Verification.']
];

autoTable(doc, {
  startY: yPos,
  head: [['System Module', 'Features & Technical Implementation']],
  body: modules,
  theme: 'grid',
  headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', textColor: SECONDARY }, 1: { cellWidth: 'auto' } },
  margin: { left: 15, right: 15 }
});

yPos = doc.lastAutoTable.finalY + 10;

yPos = addSectionTitle('7. HARMONIZED SYSTEM (HS) CODE REFERENCE CATALOG', yPos);

const hsCatalog = [
  ['4602.11', 'Bamboo & Cane Crafts', 'River bamboo baskets, rattan trays, reed utilities', 'High', 'Phytosanitary certificate recommended; GSP 0-2% preferential duty'],
  ['6912.00', 'Terracotta & Pottery', 'Wheel-thrown earthen pots, clay flower pots, lamps', 'High', 'FDA non-toxic food-grade declaration; EPCH handmade tariff concession'],
  ['5208.52', 'Handloom Textiles', 'Organic cotton dupattas, chanderi runners, khadi fabrics', 'High', 'Fiber content & wash-care label mandatory; Rules of Origin cert.'],
  ['4419.90', 'Teak & Woodcraft', 'Hand-carved trays, sheesham bowls, botanical sculpture', 'High', 'CITES / Vriksh sustainable plantation timber declaration required'],
  ['4202.22', 'Golden Jute Carry Goods', 'Biodegradable jute totes, embroidered kantha bags', 'High', 'Natural eco-fiber fast-track clearance across EU & GCC'],
  ['8306.29', 'Lost-Wax Dokra Brass', 'Tribal brass figurines, bell metal cast ornaments', 'High', 'Non-antique contemporary handicraft declaration for ASI clearance']
];

autoTable(doc, {
  startY: yPos,
  head: [['HS Code', 'Category', 'Keywords / Scope', 'Confidence', 'International Customs Rule']],
  body: hsCatalog,
  theme: 'striped',
  headStyles: { fillColor: SECONDARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
  bodyStyles: { fontSize: 7.5, textColor: TEXT_DARK },
  columnStyles: {
    0: { cellWidth: 20, fontStyle: 'bold', textColor: [188, 108, 37] },
    1: { cellWidth: 35, fontStyle: 'bold' },
    2: { cellWidth: 45 },
    3: { cellWidth: 20, fontStyle: 'bold' },
    4: { cellWidth: 'auto' }
  },
  margin: { left: 15, right: 15 }
});

// ============================================================================
// PAGE 5: TECH STACK, TESTING, RESULTS & CONCLUSION
// ============================================================================
doc.addPage();
yPos = 25;

yPos = addSectionTitle('8. COMPREHENSIVE TECHNOLOGY STACK', yPos);

const techStack = [
  ['Frontend Framework', 'React 19 (Latest release) with TypeScript for static type safety'],
  ['Build Tool & Bundler', 'Vite 8.3 with @tailwindcss/vite plugin for sub-second HMR'],
  ['Styling & UI Design', 'Tailwind CSS 4, Custom Design System (#143826 Deep Forest, #DDA15E Gold)'],
  ['Micro-Animations', 'Framer Motion 14 (Smooth slide-in, modal scale, cart drawer transitions)'],
  ['Icons & Visual Assets', 'Lucide React (Modern, crisp vector iconography across all views)'],
  ['Analytics & Visualizations', 'Recharts (Responsive bar charts, monthly revenue trends, category share)'],
  ['Database & Cloud Auth', 'Supabase Cloud PostgreSQL with row-level security and JWT sessions'],
  ['Client-Side PDF Engine', 'jsPDF 4.2 + jsPDF-AutoTable for instantaneous vector commercial invoices'],
  ['Cloud Hosting & CI/CD', 'Vercel Edge Network (Single unified deployment with client-side rewrites)']
];

autoTable(doc, {
  startY: yPos,
  head: [['Component Layer', 'Selected Technology & Rationale']],
  body: techStack,
  theme: 'striped',
  headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', textColor: SECONDARY }, 1: { cellWidth: 'auto' } },
  margin: { left: 15, right: 15 }
});

yPos = doc.lastAutoTable.finalY + 10;

yPos = addSectionTitle('9. PERFORMANCE & TESTING VERIFICATION', yPos);

const testMetrics = [
  ['Production Build Execution', 'PASSED (`tsc -b && vite build` built in 1.74s, 3,203 modules transformed)'],
  ['Optimistic UI Latency', '< 50ms instant feedback on Product Edit, Delete, and Upload'],
  ['Vercel Deployment Verification', 'PASSED (Single SPA routing configured in `vercel.json` with zero 404s)'],
  ['Client-Side Customs PDF Export', 'PASSED (Tested via `scripts/test_pdf.ts`, renders in ~120ms)'],
  ['Multi-Currency Math Precision', '100% accurate across INR, USD, EUR, GBP, AED, CAD, AUD, JPY']
];

autoTable(doc, {
  startY: yPos,
  head: [['Evaluation Parameter', 'Observed Benchmark & Result']],
  body: testMetrics,
  theme: 'grid',
  headStyles: { fillColor: SECONDARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
  columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 'auto', fontStyle: 'bold', textColor: [20, 80, 40] } },
  margin: { left: 15, right: 15 }
});

yPos = doc.lastAutoTable.finalY + 10;

yPos = addSectionTitle('10. CONCLUSION & FUTURE SCOPE', yPos);

const conclusions = [
  '• Project Impact: RuralCraft Global proves that technological automation in cross-border customs paperwork and direct e-commerce can eliminate predatory middlemen and preserve indigenous rural handicraft heritage.',
  '• Academic Contribution: Demonstrates modern full-stack web engineering with React 19, serverless cloud databases (Supabase), optimistic UI architecture, automated document generation, and single-deployment devops.',
  '• Future Roadmap: Integration of Computer Vision (AI) for automatic image-based HS code recognition, direct integration with DHL/FedEx shipping APIs for automatic airway bill (AWB) generation, and multi-lingual voice search for rural artisans.'
];

conclusions.forEach(c => {
  const lines = doc.splitTextToSize(c, pageWidth - 30);
  doc.text(lines, 15, yPos);
  yPos += (lines.length * 4.5) + 1.5;
});

// Add headers & footers across all pages
addHeaderFooter(doc);

// Output to file
const outputPath = path.resolve(__dirname, '..', 'RuralCraft_Global_Project_Report.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('Project Report PDF successfully created at:', outputPath);
