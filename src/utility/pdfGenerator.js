import puppeteer from 'puppeteer';

/**
 * Generates a premium PDF from HTML content.
 * @param {string} htmlContent - The HTML body content (already converted from markdown).
 * @param {Object} options - Additional options like company name.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
export const generatePremiumPDF = async (htmlContent, { companyName = 'AI Workshop' } = {}) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Prepare the full HTML with premium styling
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary: #6366f1;
                  --bg: #0f172a;
                  --card-bg: rgba(30, 41, 59, 0.7);
                  --border: rgba(255, 255, 255, 0.1);
                  --text: #e2e8f0;
                  --text-heading: #ffffff;
              }

              body {
                  font-family: 'Inter', sans-serif;
                  background-color: var(--bg);
                  color: var(--text);
                  margin: 0;
                  padding: 2rem;
                  line-height: 1.6;
                  -webkit-print-color-adjust: exact;
              }

              .container { max-width: 1000px; margin: 0 auto; }

              .glass-report {
                  background: var(--card-bg);
                  border: 1px solid var(--border);
                  border-radius: 1.5rem;
                  padding: 4rem;
                  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
              }

              .report-header {
                  border-bottom: 2px solid var(--primary);
                  padding-bottom: 2rem;
                  margin-bottom: 3rem;
                  text-align: center;
              }

              .report-header h1 { font-size: 2.5rem; color: var(--text-heading); margin-bottom: 0.5rem; }
              .report-header p { color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; }

              h1, h2, h3, h4 { color: var(--text-heading); }
              h1 { font-size: 2.5rem; margin-bottom: 2rem; }
              h2 { font-size: 1.8rem; margin-top: 3rem; border-left: 4px solid var(--primary); padding-left: 1rem; }
              h3 { font-size: 1.3rem; color: var(--primary); margin-top: 2rem; text-transform: uppercase; }

              p { margin-bottom: 1.25rem; opacity: 0.9; }

              ul, ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
              
              strong { color: var(--primary); }

              /* Break sections onto new pages if necessary */
              h2 { page-break-before: always; }
              .report-header { page-break-before: avoid; }

              @media print {
                  body { background-color: #0f172a !important; color: #e2e8f0 !important; }
                  .glass-report { box-shadow: none; border: 1px solid rgba(255, 255, 255, 0.1); }
              }

              /* Page numbering */
              @page {
                  margin: 1cm;
                  @bottom-right {
                      content: counter(page);
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="glass-report">
                  <div class="report-header">
                      <p>Strategic Scenario Planning Report</p>
                      <h1>${companyName}</h1>
                  </div>
                  <div class="report-content">
                      ${htmlContent}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};
