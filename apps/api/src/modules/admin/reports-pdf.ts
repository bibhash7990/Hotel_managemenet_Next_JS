import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type Row = string[];

export async function buildBookingsReportPdf(headers: string[], rows: Row[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageMargin = 40;
  const lineHeight = 14;
  let page = doc.addPage([612, 792]);
  let height = page.getSize().height;
  let y = height - pageMargin;

  const title = 'StayHub — bookings report';
  page.drawText(title, { x: pageMargin, y, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= lineHeight * 2;

  const colWidths = headers.map((h) => Math.max(60, Math.min(120, h.length * 6 + 20)));

  const drawRow = (cells: string[], bold: boolean) => {
    if (y < pageMargin + lineHeight) {
      page = doc.addPage([612, 792]);
      height = page.getSize().height;
      y = height - pageMargin;
    }
    let x = pageMargin;
    cells.forEach((cell, i) => {
      const w = colWidths[i] ?? 80;
      const text = cell.length > 40 ? `${cell.slice(0, 37)}...` : cell;
      page.drawText(text, {
        x,
        y,
        size: 9,
        font: bold ? fontBold : font,
        color: rgb(0.15, 0.15, 0.2),
        maxWidth: w - 4,
      });
      x += w;
    });
    y -= lineHeight;
  };

  drawRow(headers, true);
  for (const row of rows) {
    drawRow(row, false);
  }

  return doc.save();
}
