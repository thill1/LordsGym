import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFillablePDF() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, 'CLIENT_UAT_PLAN.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF with form fields preserved
    console.log('Generating fillable PDF...');
    await page.pdf({
      path: 'CLIENT_UAT_PLAN_FILLABLE.pdf',
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '30mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:8px;text-align:center;width:100%;color:#666;padding-bottom:8px;">
          <strong>Troy Hill</strong> | Sentient Partners | Phone: 415-504-2757 | Email: troyhill@sentientparters.ai
        </div>
      `,
      footerTemplate: `
        <div style="font-size:9px;text-align:center;width:100%;color:#999;padding-top:10px;opacity:0.6;">
          Lord's Gym - Phase 1 Project Report | Confidential
        </div>
      `
    });
    
    
    console.log('✓ Fillable PDF created: CLIENT_UAT_PLAN_FILLABLE.pdf');
    console.log('\nNote: Puppeteer PDFs preserve form fields, but for best fillable PDF experience,');
    console.log('you may want to use Adobe Acrobat Pro to convert this to a fully interactive PDF form.');
    console.log('\nAlternatively, clients can fill out the HTML form and print to PDF.');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    await browser.close();
  }
}

generateFillablePDF().catch(console.error);
