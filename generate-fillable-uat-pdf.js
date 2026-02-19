import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import { mdToPdf } from 'md-to-pdf';

// First, generate the base PDF from markdown
async function generateBasePDF() {
  console.log('Generating base PDF from markdown...');
  const pdf = await mdToPdf({ path: 'CLIENT_UAT_PLAN.md }, {
    pdf_options: {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '40mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="font-size:9px;text-align:center;width:100%;color:#999;padding-top:10px;opacity:0.5;">
          Lord's Gym - Phase 1 Project Report | Confidential
        </div>
      `,
      headerTemplate: `
        <div style="font-size:9px;text-align:center;width:100%;color:#333;padding-bottom:10px;">
          <strong>Troy Hill</strong> | Sentient Partners | Phone: 415-504-2757
        </div>
      `
    }
  });
  
  if (pdf) {
    fs.writeFileSync('CLIENT_UAT_PLAN_BASE.pdf', pdf.content);
    console.log('✓ Base PDF created');
    return pdf.content;
  }
  return null;
}

// Note: Adding fillable form fields programmatically is complex
// For fillable PDFs, it's better to use Adobe Acrobat Pro or similar tools
// Or create an HTML form version

console.log(`
Note: This script generates a base PDF. 
For fillable form fields, you have two options:
1. Open CLIENT_UAT_PLAN_BASE.pdf in Adobe Acrobat Pro and add form fields
2. Use the HTML version (CLIENT_UAT_PLAN.html) which can be filled in browser and printed to PDF
`);

generateBasePDF().catch(console.error);
