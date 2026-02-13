import { mdToPdf } from 'md-to-pdf';
import fs from 'fs';
import path from 'path';

// Base PDF options for all documents
const basePdfOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '30mm',
    left: '15mm'
  },
  printBackground: true,
  displayHeaderFooter: true,
  pdf_options: {
    displayHeaderFooter: true
  }
};

// Specific options for UAT Plan
const uatPdfOptions = {
  ...basePdfOptions,
  footerTemplate: '<div style="font-size:9px;text-align:center;width:100%;color:#999;padding-top:10px;opacity:0.6;"><span>Lord\'s Gym - Phase 1 Project Report | Confidential</span></div>',
  headerTemplate: '<div style="font-size:8px;text-align:center;width:100%;color:#666;padding-bottom:8px;"><strong>Troy Hill</strong> | Sentient Partners | Phone: 415-504-2757 | Email: troyhill@sentientparters.ai</div>',
  css: `
    @page {
      size: A4;
      margin: 20mm 15mm 30mm 15mm;
    }
    
    body {
      font-size: 11pt;
      line-height: 1.5;
    }
    
    h2 {
      page-break-after: avoid;
      page-break-inside: avoid;
      margin-top: 20px;
      margin-bottom: 12px;
    }
    
    h3 {
      page-break-after: avoid;
      margin-top: 15px;
      margin-bottom: 8px;
    }
    
    .test-item {
      page-break-inside: avoid;
      margin: 12px 0;
    }
    
    .section {
      page-break-inside: avoid;
    }
    
    .sign-off {
      page-break-before: always;
      page-break-inside: avoid;
    }
    
    ul {
      page-break-inside: avoid;
    }
    
    .form-field {
      page-break-inside: avoid;
    }
  `
};

// Options for Phase 1 Report
const reportPdfOptions = {
  ...basePdfOptions,
  footerTemplate: '<div style="font-size:9px;text-align:center;width:100%;color:#999;padding-top:10px;opacity:0.6;"><span>Lord\'s Gym - Phase 1 Project Report | Confidential</span></div>',
  headerTemplate: '<div style="font-size:8px;text-align:center;width:100%;color:#666;padding-bottom:8px;"><strong>Troy Hill</strong> | Sentient Partners | Phone: 415-504-2757 | Email: troyhill@sentientparters.ai</div>'
};

async function generatePDFs() {
  const files = [
    { file: 'PHASE_1_PROJECT_REPORT.md', options: reportPdfOptions },
    { file: 'CLIENT_UAT_PLAN.md', options: uatPdfOptions }
  ];

  for (const { file, options } of files) {
    try {
      console.log(`Generating PDF from ${file}...`);
      const pdf = await mdToPdf({ path: file }, options);
      
      if (pdf) {
        const outputFile = file.replace('.md', '.pdf');
        fs.writeFileSync(outputFile, pdf.content);
        console.log(`✓ Created ${outputFile}`);
      }
    } catch (error) {
      console.error(`Error generating PDF from ${file}:`, error.message);
    }
  }
}

generatePDFs().catch(console.error);
