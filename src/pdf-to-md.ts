import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'iconify-icon';
import './style.css';
import { convertPdfToMarkdown } from './pdf-converter';

function showToast(message: string) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast?.classList.remove('show');
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('pdfFileInput') as HTMLInputElement;
  const btnSelectFile = document.getElementById('btnSelectFile');
  const btnSamplePdf = document.getElementById('btnSamplePdf');

  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar') as HTMLElement;
  const progressText = document.getElementById('progressText');

  const resultSection = document.getElementById('resultSection');
  const uploadSection = document.getElementById('uploadSection');

  const mdOutput = document.getElementById('mdOutput') as HTMLTextAreaElement;
  const mdPreview = document.getElementById('mdPreview') as HTMLElement;

  const optDividers = document.getElementById('optDividers') as HTMLInputElement;
  const optHeadings = document.getElementById('optHeadings') as HTMLInputElement;
  const optLineBreaks = document.getElementById('optLineBreaks') as HTMLInputElement;

  const statPages = document.getElementById('statPages');
  const statWords = document.getElementById('statWords');
  const statChars = document.getElementById('statChars');

  const tabEditor = document.getElementById('tabEditor');
  const tabPreview = document.getElementById('tabPreview');
  const btnCopyMd = document.getElementById('btnCopyMd');
  const btnDownloadMd = document.getElementById('btnDownloadMd');
  const btnOpenViewer = document.getElementById('btnOpenViewer');
  const btnOpenCard = document.getElementById('btnOpenCard');
  const btnConvertAnother = document.getElementById('btnConvertAnother');

  const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;

  if (themeSelect) {
    const savedTheme = localStorage.getItem('mdpreview_theme') || 'github-light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;

    themeSelect.addEventListener('change', () => {
      const theme = themeSelect.value;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('mdpreview_theme', theme);
    });
  }

  let currentRawMarkdown = '';
  let currentFileName = 'document';

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  function updateResultStats(text: string, pages: number = 1) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    if (statPages) statPages.textContent = pages.toString();
    if (statWords) statWords.textContent = words.toLocaleString();
    if (statChars) statChars.textContent = chars.toLocaleString();
  }

  function renderOutputPreview(text: string) {
    if (mdPreview) {
      mdPreview.innerHTML = marked.parse(text) as string;
      mdPreview.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el as HTMLElement);
      });
    }
  }

  async function processPdfFile(file: File | Blob, name: string = 'document.pdf') {
    currentFileName = name.replace(/\.[^/.]+$/, '');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (resultSection) resultSection.style.display = 'none';
    if (progressContainer) {
      progressContainer.style.display = 'block';
      if (progressBar) progressBar.style.width = '0%';
      if (progressText) progressText.textContent = 'Reading PDF file...';
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let totalPageCount = 1;

      const markdown = await convertPdfToMarkdown(arrayBuffer, {
        includeDividers: optDividers ? optDividers.checked : true,
        detectHeadings: optHeadings ? optHeadings.checked : true,
        preserveLineBreaks: optLineBreaks ? optLineBreaks.checked : false,
        onProgress: (current, total) => {
          totalPageCount = total;
          const percent = Math.round((current / total) * 100);
          if (progressBar) progressBar.style.width = percent + '%';
          if (progressText) progressText.textContent = 'Extracting page ' + current + ' of ' + total + ' (' + percent + '%)...';
        }
      });

      currentRawMarkdown = markdown;
      if (mdOutput) mdOutput.value = markdown;
      renderOutputPreview(markdown);
      updateResultStats(markdown, totalPageCount);

      if (progressContainer) progressContainer.style.display = 'none';
      if (resultSection) resultSection.style.display = 'block';
      showToast('PDF successfully converted to Markdown!');
    } catch (err: any) {
      console.error('PDF conversion failed:', err);
      if (progressContainer) progressContainer.style.display = 'none';
      if (uploadSection) uploadSection.style.display = 'block';
      alert('Failed to parse PDF: ' + (err.message || 'Unknown error. Make sure the file is a valid PDF document.'));
    }
  }

  // Drag and drop events
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          processPdfFile(file, file.name);
        } else {
          alert('Please select a valid PDF file (.pdf).');
        }
      }
    });

    dropZone.addEventListener('click', () => {
      fileInput?.click();
    });
  }

  btnSelectFile?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      processPdfFile(file, file.name);
    }
  });

  // Sample PDF demo
  btnSamplePdf?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const sampleMarkdown = '# MDPreview Product Specification\n\nWelcome to **MDPreview** - the ultra-fast, privacy-first Markdown workspace!\n\n## Key Features\n\n- **100% Client-Side Processing**: No servers, no tracking, complete privacy.\n- **Instant Live Preview**: Powered by marked and highlight.js.\n- **Export Capabilities**:\n  - Export to HTML\n  - Export to Markdown\n  - Generate Social Cards (MD to Card)\n  - PDF to Markdown Extraction (PDF to MD)\n\n## Code Example\n\n`	ypescript\ninterface DocumentItem {\n  id: string;\n  title: string;\n  wordCount: number;\n}\n`\n\n> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra\n\n---\n\nEnjoy converting documents seamlessly!';
    currentRawMarkdown = sampleMarkdown;
    currentFileName = 'sample-specification';
    if (mdOutput) mdOutput.value = sampleMarkdown;
    renderOutputPreview(sampleMarkdown);
    updateResultStats(sampleMarkdown, 1);

    if (uploadSection) uploadSection.style.display = 'none';
    if (resultSection) resultSection.style.display = 'block';
    showToast('Loaded sample document conversion!');
  });

  // Tab switching: Editor vs Preview
  tabEditor?.addEventListener('click', () => {
    tabEditor.classList.add('active');
    tabPreview?.classList.remove('active');
    if (mdOutput) mdOutput.style.display = 'block';
    if (mdPreview) mdPreview.style.display = 'none';
  });

  tabPreview?.addEventListener('click', () => {
    tabPreview.classList.add('active');
    tabEditor?.classList.remove('active');
    if (mdOutput) mdOutput.style.display = 'none';
    if (mdPreview) mdPreview.style.display = 'block';
  });

  mdOutput?.addEventListener('input', () => {
    currentRawMarkdown = mdOutput.value;
    renderOutputPreview(currentRawMarkdown);
    updateResultStats(currentRawMarkdown);
  });

  // Actions
  btnCopyMd?.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRawMarkdown).then(() => {
      showToast('Markdown copied to clipboard!');
    });
  });

  btnDownloadMd?.addEventListener('click', () => {
    const blob = new Blob([currentRawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName + '.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Markdown file downloaded!');
  });

  btnOpenViewer?.addEventListener('click', () => {
    localStorage.setItem('mdpreview_content', currentRawMarkdown);
    window.location.href = '/';
  });

  btnOpenCard?.addEventListener('click', () => {
    localStorage.setItem('mdpreview_content', currentRawMarkdown);
    window.location.href = '/md-to-card.html';
  });

  btnConvertAnother?.addEventListener('click', () => {
    if (fileInput) fileInput.value = '';
    if (resultSection) resultSection.style.display = 'none';
    if (uploadSection) uploadSection.style.display = 'block';
  });
});
