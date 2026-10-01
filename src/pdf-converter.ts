import * as pdfjsLib from 'pdfjs-dist';

// Use worker from local node_modules via Vite url or CDN fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + pdfjsLib.version + '/pdf.worker.min.mjs';
}

export interface PdfConvertOptions {
  includeDividers?: boolean;
  detectHeadings?: boolean;
  preserveLineBreaks?: boolean;
  onProgress?: (current: number, total: number) => void;
}

interface TextToken {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
}

interface TextLine {
  y: number;
  fontSize: number;
  isBold: boolean;
  tokens: TextToken[];
  text: string;
}

export async function convertPdfToMarkdown(
  fileData: ArrayBuffer | Uint8Array,
  options: PdfConvertOptions = {}
): Promise<string> {
  const {
    includeDividers = true,
    detectHeadings = true,
    preserveLineBreaks = false,
    onProgress
  } = options;

  const loadingTask = pdfjsLib.getDocument({
    data: fileData,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const markdownPages: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(pageNum, numPages);
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (!items || items.length === 0) {
      continue;
    }

    const tokens: TextToken[] = [];
    const fontSizes: number[] = [];

    for (const item of items) {
      if (!item.str || !item.str.trim()) continue;

      const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.abs(tx[0]) || Math.abs(tx[3]) || 12;
      const x = tx[4];
      const y = tx[5];
      const fontName = (item.fontName || '').toLowerCase();
      const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || fontName.includes('w7') || fontName.includes('w8') || fontName.includes('w9');
      const isItalic = fontName.includes('italic') || fontName.includes('oblique');

      tokens.push({
        text: item.str,
        x,
        y,
        width: item.width || 0,
        height: item.height || fontSize,
        fontSize,
        fontName,
        isBold,
        isItalic
      });

      fontSizes.push(fontSize);
    }

    if (tokens.length === 0) continue;

    // Calculate median body font size
    fontSizes.sort((a, b) => a - b);
    const medianFontSize = fontSizes[Math.floor(fontSizes.length / 2)] || 12;

    // Group tokens into lines based on Y coordinate with tolerance (4px)
    const lines: TextLine[] = [];
    tokens.sort((a, b) => b.y - a.y || a.x - b.x); // top-to-bottom

    for (const token of tokens) {
      let matchedLine = lines.find(l => Math.abs(l.y - token.y) <= 4);
      if (!matchedLine) {
        matchedLine = {
          y: token.y,
          fontSize: token.fontSize,
          isBold: token.isBold,
          tokens: [],
          text: ''
        };
        lines.push(matchedLine);
      }
      matchedLine.tokens.push(token);
    }

    // Sort tokens horizontally within each line
    for (const line of lines) {
      line.tokens.sort((a, b) => a.x - b.x);
      
      let lineText = '';
      for (let i = 0; i < line.tokens.length; i++) {
        const curr = line.tokens[i];
        if (i > 0) {
          const prev = line.tokens[i - 1];
          const gap = curr.x - (prev.x + prev.width);
          // Insert space if there is a gap between words
          if (gap > 2 && !lineText.endsWith(' ') && !curr.text.startsWith(' ')) {
            lineText += ' ';
          }
        }
        lineText += curr.text;
      }
      line.text = lineText.trim();
      line.fontSize = line.tokens.reduce((acc, t) => acc + t.fontSize, 0) / line.tokens.length;
      line.isBold = line.tokens.every(t => t.isBold);
    }

    // Sort lines by y descending (top to bottom of page)
    lines.sort((a, b) => b.y - a.y);

    const pageMarkdownLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let text = line.text;
      if (!text) continue;

      // Check heading detection
      if (detectHeadings) {
        const ratio = line.fontSize / medianFontSize;
        if (ratio >= 1.6 || (ratio >= 1.35 && line.isBold)) {
          pageMarkdownLines.push('');
          pageMarkdownLines.push('# ' + text.replace(/^[#s]+/, ''));
          pageMarkdownLines.push('');
          inList = false;
          continue;
        } else if (ratio >= 1.3 || (ratio >= 1.18 && line.isBold)) {
          pageMarkdownLines.push('');
          pageMarkdownLines.push('## ' + text.replace(/^[#s]+/, ''));
          pageMarkdownLines.push('');
          inList = false;
          continue;
        } else if (ratio >= 1.15 && line.isBold) {
          pageMarkdownLines.push('');
          pageMarkdownLines.push('### ' + text.replace(/^[#s]+/, ''));
          pageMarkdownLines.push('');
          inList = false;
          continue;
        }
      }

      // Check bullet points
      const isBullet = ["-", "*", "•", "‣", "◦", "⁃", "∙"].some(b => text.startsWith(b + " ") || text.startsWith(b + "	")); const bulletMatch = isBullet ? [text, text.charAt(0), text.slice(2).trim()] : null;
      const numberListMatch = text.match(/^(d+[.)])s+(.*)/);

      if (bulletMatch) {
        pageMarkdownLines.push('- ' + bulletMatch[2]);
        inList = true;
      } else if (numberListMatch) {
        pageMarkdownLines.push(numberListMatch[1] + ' ' + numberListMatch[2]);
        inList = true;
      } else {
        if (inList) {
          pageMarkdownLines.push('');
          inList = false;
        }
        if (preserveLineBreaks) {
          pageMarkdownLines.push(text + '  ');
        } else {
          pageMarkdownLines.push(text);
        }
      }
    }

    // Join lines for this page
    const pageContent = pageMarkdownLines.join(String.fromCharCode(10)).replace(new RegExp(String.fromCharCode(10) + "{3,}", "g"), String.fromCharCode(10) + String.fromCharCode(10)).trim();
    if (pageContent) {
      markdownPages.push(pageContent);
    }
  }

  const nl = String.fromCharCode(10);
  const separator = includeDividers ? (nl + nl + '---' + nl + nl) : (nl + nl);
  return markdownPages.join(separator);
}
