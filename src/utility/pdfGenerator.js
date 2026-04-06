import PDFDocument from 'pdfkit';

/**
 * Generates a premium PDF document using PDFKit (Zero system dependencies).
 * Faster, lighter, and more reliable on VPS environments.
 */
export const generatePremiumPDF = async (markdownContent, { companyName = 'Strategic Report' } = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', chunks => buffers.push(chunks));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- STYLING CONSTANTS ---
      const colors = {
        primary: '#6366f1', // Indigo
        heading: '#1e293b', // Slate 800
        text: '#475569',    // Slate 600
        border: '#e2e8f0'   // Slate 200
      };

      // --- HEADER & LOGO ---
      doc.fillColor(colors.primary)
         .fontSize(10)
         .text('STRATEGIC SCENARIO PLANNING', { characterSpacing: 2 })
         .moveDown(0.5);

      doc.fillColor(colors.heading)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text(companyName)
         .moveDown(0.2);

      doc.strokeColor(colors.primary)
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke()
         .moveDown(1.5);

      // --- CONTENT PARSER (Simple Markdown-ish) ---
      const lines = markdownContent.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed && trimmed !== "") {
          doc.moveDown(0.5);
          return;
        }

        // H1 (##)
        if (line.startsWith('## ')) {
          doc.moveDown(1)
             .fillColor(colors.primary)
             .font('Helvetica-Bold')
             .fontSize(18)
             .text(line.replaceAll('## ', '').toUpperCase(), { characterSpacing: 1 })
             .moveDown(0.5);
        }
        // H2 (###)
        else if (line.startsWith('### ')) {
          doc.moveDown(0.8)
             .fillColor(colors.heading)
             .font('Helvetica-Bold')
             .fontSize(14)
             .text(line.replaceAll('### ', ''))
             .moveDown(0.3);
        }
        // Bullet Points
        else if (line.startsWith('- ') || line.startsWith('* ')) {
          doc.fillColor(colors.text)
             .font('Helvetica')
             .fontSize(11)
             .text('• ' + line.substring(2), { indent: 15, lineGap: 2 });
        }
        // Bold Text (simple detect)
        else if (line.includes('**')) {
           const cleanLine = line.replace(/\*\*/g, '');
           doc.fillColor(colors.text)
              .font('Helvetica-Bold')
              .fontSize(11)
              .text(cleanLine, { indent: 15, lineGap: 2 });
        }
        // Normal Text
        else {
          doc.fillColor(colors.text)
             .font('Helvetica')
             .fontSize(11)
             .text(line, { align: 'justify', lineGap: 2 });
        }
      });

      // --- FOOTER (On every page) ---
      let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8')
           .fontSize(8)
           .text(
             `Page ${i + 1} of ${pages.count} | ${companyName} CONFIDENTIAL`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
