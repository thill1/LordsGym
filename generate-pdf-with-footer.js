import { mdToPdf } from 'md-to-pdf';
import fs from 'fs';
import path from 'path';

const pdfOptions = {
  displayHeaderFooter: true,
  footerTemplate: '<div style="font-size:10px;text-align:center;width:100%;color:#666;padding-top:10px;"><span>Sentient Partners and all rights reserved</span></div>',
  format: 'A4',
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '30mm',
    left: '15mm'
  },
  printBackground: true
};

async function generatePDFs() {
  const files = [
    'PHASE_1_FINAL_STEPS.md',
    'UAT_TEST_PLAN.md'
  ];

  for (const file of files) {
    try {
      console.log(`Generating PDF from ${file}...`);
      const pdf = await mdToPdf({ path: file }, pdfOptions);
      
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
