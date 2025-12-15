import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } from "docx";
import { ConversionResponse, ContentType, DocElement } from "../types";
import FileSaver from "file-saver";

const mapAlignment = (align?: string) => {
  switch (align) {
    case 'center': return AlignmentType.CENTER;
    case 'right': return AlignmentType.RIGHT;
    case 'justify': return AlignmentType.JUSTIFIED;
    default: return AlignmentType.LEFT;
  }
};

const createHeading = (element: DocElement): Paragraph => {
  let headingLevel = HeadingLevel.HEADING_1;
  if (element.level === 2) headingLevel = HeadingLevel.HEADING_2;
  if (element.level === 3) headingLevel = HeadingLevel.HEADING_3;

  return new Paragraph({
    text: element.text || "",
    heading: headingLevel,
    alignment: mapAlignment(element.align),
    spacing: { after: 200 }
  });
};

const createParagraph = (element: DocElement): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: element.text || "",
        bold: element.isBold,
        font: "Calibri", // Standard clean font
        size: 24, // 12pt
      })
    ],
    alignment: mapAlignment(element.align),
    spacing: { after: 120, line: 276 } // Standard spacing
  });
};

const createTable = (element: DocElement): Table | null => {
  if (!element.rows || element.rows.length === 0) return null;

  const tableRows = element.rows.map((row) => {
    const cells = row.map((cellText) => {
      return new TableCell({
        children: [new Paragraph({ text: cellText || "" })],
        width: {
          size: 100 / row.length,
          type: WidthType.PERCENTAGE,
        },
        margins: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100
        }
      });
    });
    return new TableRow({ children: cells });
  });

  return new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    }
  });
};

export const generateDocx = async (data: ConversionResponse) => {
  const children: (Paragraph | Table)[] = [];

  data.elements.forEach(el => {
    switch (el.type) {
      case ContentType.HEADING:
        children.push(createHeading(el));
        break;
      case ContentType.PARAGRAPH:
        children.push(createParagraph(el));
        break;
      case ContentType.TABLE:
        const table = createTable(el);
        if (table) children.push(table);
        break;
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  // Handle different ESM export structures for file-saver
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, "converted_document.docx");
};
