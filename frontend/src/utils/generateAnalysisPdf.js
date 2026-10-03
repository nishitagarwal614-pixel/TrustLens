import jsPDF from 'jspdf';

function cleanText(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function addWrappedText(doc, text, x, y, maxWidth, options = {}) {
  const {
    fontSize = 10,
    lineHeight = 5,
    fontStyle = 'normal'
  } = options;

  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);

  const lines = doc.splitTextToSize(cleanText(text), maxWidth);

  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.text(line, x, y);
    y += lineHeight;
  }

  return y;
}

function addSectionTitle(doc, title, y) {
  if (y > 265) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 55, 120);
  doc.text(title, 20, y);

  y += 7;

  doc.setDrawColor(210, 220, 235);
  doc.line(20, y, 190, y);

  return y + 7;
}

export function generateAnalysisPdf({
  result,
  content,
  sourceUrl,
  creatorName
}) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40;

  let y = 20;

  // Header
  doc.setFillColor(20, 55, 120);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SATARK SIGHT AI', 20, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Content Verification Report', 20, 22);

  y = 42;

  // Analysis result
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Analysis Result', 20, y);

  y += 9;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Status: ${cleanText(result?.overall_status || 'Unknown')}`,
    20,
    y
  );

  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Risk Level: ${cleanText(result?.risk_level || 'Unknown')}`,
    20,
    y
  );

  y += 12;

  // Submitted content
  y = addSectionTitle(doc, 'Submitted Content', y);

  y = addWrappedText(
    doc,
    content || 'No content provided.',
    20,
    y,
    maxWidth,
    {
      fontSize: 10,
      lineHeight: 5
    }
  );

  y += 4;

  if (sourceUrl) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Source URL:', 20, y);

    y += 5;

    doc.setTextColor(30, 90, 180);

    const urlLines = doc.splitTextToSize(sourceUrl, maxWidth);

    urlLines.forEach((line) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.textWithLink(line, 20, y, {
        url: sourceUrl
      });

      y += 5;
    });

    doc.setTextColor(20, 20, 20);
    y += 3;
  }

  if (creatorName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Creator: ${cleanText(creatorName)}`, 20, y);
    y += 7;
  }

  // AI rationale
  y = addSectionTitle(doc, 'AI Verification Rationale', y);

  y = addWrappedText(
    doc,
    result?.explanation ||
      'No verification rationale was returned.',
    20,
    y,
    maxWidth,
    {
      fontSize: 10,
      lineHeight: 5
    }
  );

  y += 5;

  // Claims
  y = addSectionTitle(doc, 'Claims Detected', y);

  const claims = result?.claims || [];

  if (claims.length === 0) {
    y = addWrappedText(
      doc,
      'No factual claims were detected.',
      20,
      y,
      maxWidth
    );
  } else {
    claims.forEach((claim, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);

      y = addWrappedText(
        doc,
        `${index + 1}. ${claim.text || ''}`,
        20,
        y,
        maxWidth,
        {
          fontSize: 10,
          lineHeight: 5,
          fontStyle: 'bold'
        }
      );

      y = addWrappedText(
        doc,
        `Type: ${claim.type || 'Factual assertion'} | Status: ${
          claim.status || 'Unverified'
        }`,
        25,
        y,
        maxWidth - 5,
        {
          fontSize: 9,
          lineHeight: 4.5
        }
      );

      if (claim.reasoning) {
        y = addWrappedText(
          doc,
          `Reasoning: ${claim.reasoning}`,
          25,
          y,
          maxWidth - 5,
          {
            fontSize: 9,
            lineHeight: 4.5
          }
        );
      }

      y += 4;
    });
  }

  // Red flags
  y = addSectionTitle(doc, 'Red-Flag Analysis', y);

  const redFlags = result?.red_flags || [];

  if (redFlags.length === 0) {
    y = addWrappedText(
      doc,
      'No red flags were detected.',
      20,
      y,
      maxWidth
    );
  } else {
    redFlags.forEach((flag, index) => {
      y = addWrappedText(
        doc,
        `${index + 1}. ${flag.type || 'Risk signal'} — Severity: ${
          flag.severity || 'Unknown'
        }`,
        20,
        y,
        maxWidth,
        {
          fontSize: 10,
          lineHeight: 5,
          fontStyle: 'bold'
        }
      );

      y = addWrappedText(
        doc,
        flag.explanation || '',
        25,
        y,
        maxWidth - 5,
        {
          fontSize: 9,
          lineHeight: 4.5
        }
      );

      y += 3;
    });
  }

  // Live web evidence
  y = addSectionTitle(doc, 'Live Web Evidence', y);

  const evidence = result?.evidence || [];

  if (evidence.length === 0) {
    y = addWrappedText(
      doc,
      'No live web evidence was retrieved.',
      20,
      y,
      maxWidth
    );
  } else {
    evidence.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      y = addWrappedText(
        doc,
        `${index + 1}. ${item.source_name || 'Web Source'}`,
        20,
        y,
        maxWidth,
        {
          fontSize: 10,
          lineHeight: 5,
          fontStyle: 'bold'
        }
      );

      y = addWrappedText(
        doc,
        `Title: ${item.document_title || 'Live Web Evidence'}`,
        25,
        y,
        maxWidth - 5,
        {
          fontSize: 9,
          lineHeight: 4.5
        }
      );

      y = addWrappedText(
        doc,
        `Status: ${item.status || 'Inconclusive'}`,
        25,
        y,
        maxWidth - 5,
        {
          fontSize: 9,
          lineHeight: 4.5
        }
      );

      if (item.excerpt) {
        y = addWrappedText(
          doc,
          `Evidence: "${item.excerpt}"`,
          25,
          y,
          maxWidth - 5,
          {
            fontSize: 9,
            lineHeight: 4.5
          }
        );
      }

      if (item.source_url) {
        y = addWrappedText(
          doc,
          'Source:',
          25,
          y,
          maxWidth - 5,
          {
            fontSize: 9,
            lineHeight: 4.5,
            fontStyle: 'bold'
          }
        );

        doc.setTextColor(30, 90, 180);
        doc.setFontSize(8);

        const urlLines = doc.splitTextToSize(
          item.source_url,
          maxWidth - 10
        );

        urlLines.forEach((line) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }

          doc.textWithLink(line, 30, y, {
            url: item.source_url
          });

          y += 4;
        });

        doc.setTextColor(20, 20, 20);
      }

      y += 5;
    });
  }

  // Disclosure
  y = addSectionTitle(doc, 'Sponsorship & Disclosure Analysis', y);

  const disclosure = result?.disclosure;

  y = addWrappedText(
    doc,
    disclosure
      ? `${disclosure.status || 'No disclosure detected'}. ${
          disclosure.explanation || ''
        }`
      : 'No disclosure information was returned.',
    20,
    y,
    maxWidth,
    {
      fontSize: 9,
      lineHeight: 4.5
    }
  );

  y += 8;

  // Disclaimer
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, maxWidth, 25, 3, 3, 'F');

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Important:', 25, y + 8);

  doc.setFont('helvetica', 'normal');

  const disclaimer =
    'AI-based verification can contain errors. Verify important information against the original authoritative source. This report is for informational purposes and is not financial advice.';

  const disclaimerLines = doc.splitTextToSize(
    disclaimer,
    maxWidth - 20
  );

  doc.text(disclaimerLines, 25, y + 14);

  // Footer on every page
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);

    doc.text(
      `Satark Sight AI • Verification Report • Page ${page} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  const date = new Date().toISOString().slice(0, 10);

  doc.save(`Satark-Sight-Verification-${date}.pdf`);
}