import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'iconify-icon';
import './style.css';
import { SAMPLE_DOCS } from './samples';

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
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const preview = document.getElementById('preview') as HTMLElement;
  const workspace = document.getElementById('workspace') as HTMLElement;
  
  const statWords = document.getElementById('statWords');
  const statChars = document.getElementById('statChars');
  const statReadTime = document.getElementById('statReadTime');

  const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
  const sampleSelect = document.getElementById('sampleSelect') as HTMLSelectElement;
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;

  const btnModeSplit = document.getElementById('btnModeSplit');
  const btnModePreview = document.getElementById('btnModePreview');
  const btnModeEditor = document.getElementById('btnModeEditor');

  const btnCopyHtml = document.getElementById('btnCopyHtml');
  const btnCopyMd = document.getElementById('btnCopyMd');
  const btnDownloadMd = document.getElementById('btnDownloadMd');
  const btnExportHtml = document.getElementById('btnExportHtml');
  const btnClear = document.getElementById('btnClear');
  const btnMakeCard = document.getElementById('btnMakeCard');
  const btnOpenFile = document.getElementById('btnOpenFile');
  const paneResizer = document.getElementById('paneResizer');

  if (!editor || !preview) return;

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  const renderer = new marked.Renderer();
  renderer.code = function({ text, lang }: { text: string; lang?: string }) {
    const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    let highlighted = '';
    try {
      highlighted = hljs.highlight(text, { language: validLang }).value;
    } catch {
      highlighted = hljs.highlightAuto(text).value;
    }
    return '<div class="code-wrapper">' +
      '<div class="code-header">' +
        '<span>' + validLang.toUpperCase() + '</span>' +
        '<button class="btn-copy-code" type="button" data-code="' + encodeURIComponent(text) + '">Copy</button>' +
      '</div>' +
      '<pre><code class="hljs language-' + validLang + '">' + highlighted + '</code></pre>' +
    '</div>';
  };

  renderer.heading = function({ tokens, depth }: { tokens: any[]; depth: number }) {
    const text = (this as any).parser.parseInline(tokens);
    return `<div class="md-preview-heading md-preview-h${depth}" role="heading" aria-level="${depth}">${text}</div>\n`;
  };

  marked.use({ renderer });

  function updateStats(text: string) {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200);

    if (statWords) statWords.textContent = words.toLocaleString();
    if (statChars) statChars.textContent = chars.toLocaleString();
    if (statReadTime) statReadTime.textContent = readTime + ' min';
  }

  let renderTimeout: any = null;
  function renderMarkdown() {
    const raw = editor.value;
    updateStats(raw);
    localStorage.setItem('mdpreview_content', raw);

    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      preview.innerHTML = marked.parse(raw) as string;
      attachCodeCopyButtons();
    }, 50);
  }

  function attachCodeCopyButtons() {
    const copyBtns = preview.querySelectorAll('.btn-copy-code');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const codeText = decodeURIComponent(target.getAttribute('data-code') || '');
        navigator.clipboard.writeText(codeText).then(() => {
          const original = target.textContent;
          target.textContent = 'Copied!';
          setTimeout(() => {
            target.textContent = original;
          }, 1500);
        });
      });
    });
  }

  function insertFormatting(prefix: string, suffix: string = '', defaultText: string = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end) || defaultText;
    const replacement = prefix + selected + suffix;
    editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
    editor.focus();
    editor.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    renderMarkdown();
  }

  const formatActions: Record<string, () => void> = {
    bold: () => insertFormatting('**', '**', 'bold text'),
    italic: () => insertFormatting('*', '*', 'italic text'),
    h2: () => insertFormatting('\n## ', '\n', 'Heading 2'),
    h3: () => insertFormatting('\n### ', '\n', 'Heading 3'),
    code: () => insertFormatting('`', '`', 'code'),
    codeblock: () => insertFormatting('\n```javascript\n', '\n```\n', '// code here'),
    quote: () => insertFormatting('\n> ', '\n', 'Quote here'),
    table: () => insertFormatting('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Item 1 | Item 2 |\n'),
    task: () => insertFormatting('\n- [ ] ', '', 'New task'),
    link: () => insertFormatting('[', '](https://example.com)', 'link text')
  };

  document.querySelectorAll('.btn-format').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action && formatActions[action]) {
        formatActions[action]();
      }
    });
  });

  let isScrollingEditor = false;
  let isScrollingPreview = false;

  editor.addEventListener('scroll', () => {
    if (isScrollingPreview) return;
    isScrollingEditor = true;
    const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    setTimeout(() => { isScrollingEditor = false; }, 50);
  });

  preview.addEventListener('scroll', () => {
    if (isScrollingEditor) return;
    isScrollingPreview = true;
    const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
    editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
    setTimeout(() => { isScrollingPreview = false; }, 50);
  });

  editor.addEventListener('input', renderMarkdown);

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      renderMarkdown();
    }
  });

  // Draggable Split Pane Resizer
  let currentSplitRatio = parseFloat(localStorage.getItem('mdpreview_split_ratio') || '50');
  if (isNaN(currentSplitRatio) || currentSplitRatio < 15 || currentSplitRatio > 85) {
    currentSplitRatio = 50;
  }

  function applySplitRatio(percent: number) {
    currentSplitRatio = percent;
    workspace.style.setProperty('--editor-width', percent + '%');
  }

  applySplitRatio(currentSplitRatio);

  if (paneResizer) {
    let isDragging = false;

    paneResizer.addEventListener('pointerdown', (e: PointerEvent) => {
      isDragging = true;
      paneResizer.setPointerCapture(e.pointerId);
      paneResizer.classList.add('is-dragging');
      document.body.classList.add('is-resizing');
    });

    paneResizer.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = workspace.getBoundingClientRect();
      if (rect.width <= 0) return;
      const offsetX = e.clientX - rect.left;
      let ratio = (offsetX / rect.width) * 100;

      const minPercent = Math.max(15, (220 / rect.width) * 100);
      const maxPercent = Math.min(85, 100 - minPercent);
      ratio = Math.max(minPercent, Math.min(maxPercent, ratio));

      applySplitRatio(ratio);
    });

    const stopDragging = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      paneResizer.classList.remove('is-dragging');
      document.body.classList.remove('is-resizing');
      try {
        paneResizer.releasePointerCapture(e.pointerId);
      } catch {}
      localStorage.setItem('mdpreview_split_ratio', currentSplitRatio.toFixed(2));
    };

    paneResizer.addEventListener('pointerup', stopDragging);
    paneResizer.addEventListener('pointercancel', stopDragging);

    // Double-click resets to 50/50
    paneResizer.addEventListener('dblclick', () => {
      applySplitRatio(50);
      localStorage.setItem('mdpreview_split_ratio', '50');
      showToast('Split reset to 50/50');
    });
  }

  function setViewMode(mode: 'split' | 'preview' | 'editor') {
    workspace.classList.remove('mode-split', 'mode-preview', 'mode-editor');
    workspace.classList.add('mode-' + mode);
    btnModeSplit?.classList.toggle('active', mode === 'split');
    btnModePreview?.classList.toggle('active', mode === 'preview');
    btnModeEditor?.classList.toggle('active', mode === 'editor');
    localStorage.setItem('mdpreview_mode', mode);
    if (mode === 'split') {
      applySplitRatio(currentSplitRatio);
    }
  }

  btnModeSplit?.addEventListener('click', () => setViewMode('split'));
  btnModePreview?.addEventListener('click', () => setViewMode('preview'));
  btnModeEditor?.addEventListener('click', () => setViewMode('editor'));

  const savedMode = (localStorage.getItem('mdpreview_mode') as 'split' | 'preview' | 'editor') || 'split';
  setViewMode(savedMode);

  function setTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeSelect) themeSelect.value = theme;
    localStorage.setItem('mdpreview_theme', theme);
  }

  themeSelect?.addEventListener('change', () => setTheme(themeSelect.value));
  const savedTheme = localStorage.getItem('mdpreview_theme') || 'github-light';
  setTheme(savedTheme);

  sampleSelect?.addEventListener('change', () => {
    const key = sampleSelect.value;
    if (SAMPLE_DOCS[key]) {
      editor.value = SAMPLE_DOCS[key];
      renderMarkdown();
      showToast('Loaded sample: ' + key);
    }
  });

  btnOpenFile?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.value = event.target?.result as string || '';
        renderMarkdown();
        showToast('Opened: ' + file.name);
      };
      reader.readAsText(file);
    }
  });

  editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    editor.style.borderColor = 'var(--accent-color)';
  });

  editor.addEventListener('dragleave', () => {
    editor.style.borderColor = 'var(--border-color)';
  });

  editor.addEventListener('drop', (e) => {
    e.preventDefault();
    editor.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer?.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        showToast('Redirecting to PDF to MD Converter...');
        setTimeout(() => {
          window.location.href = '/pdf-to-md.html';
        }, 600);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.value = event.target?.result as string || '';
        renderMarkdown();
        showToast('Loaded: ' + file.name);
      };
      reader.readAsText(file);
    }
  });

  btnCopyHtml?.addEventListener('click', () => {
    navigator.clipboard.writeText(preview.innerHTML.replace(/<div class="md-preview-heading md-preview-h(\d)" role="heading" aria-level="\d">(.*?)<\/div>/g, '<h$1>$2</h$1>')).then(() => {
      showToast('HTML copied to clipboard!');
    });
  });

  btnCopyMd?.addEventListener('click', () => {
    navigator.clipboard.writeText(editor.value).then(() => {
      showToast('Markdown copied to clipboard!');
    });
  });

  btnDownloadMd?.addEventListener('click', () => {
    const blob = new Blob([editor.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded document.md');
  });

  btnExportHtml?.addEventListener('click', () => {
    const htmlContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Exported Markdown - MDPreview</title>\n  <style>\n    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 860px; margin: 3rem auto; padding: 0 1.5rem; color: #1e293b; }\n    h1, h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }\n    code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; }\n    pre { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }\n    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }\n    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }\n    th { background: #f8fafc; }\n    blockquote { border-left: 4px solid #0284c7; margin: 1rem 0; padding: 0.5rem 1rem; background: #f8fafc; color: #64748b; }\n  </style>\n</head>\n<body>\n' + preview.innerHTML.replace(/<div class="md-preview-heading md-preview-h(\d)" role="heading" aria-level="\d">(.*?)<\/div>/g, '<h$1>$2</h$1>') + '\n</body>\n</html>';
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported export.html');
  });

  btnMakeCard?.addEventListener('click', () => {
    localStorage.setItem('mdpreview_content', editor.value);
  });

  btnClear?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      editor.value = '';
      renderMarkdown();
      showToast('Editor cleared');
    }
  });

  const savedContent = localStorage.getItem('mdpreview_content');
  editor.value = savedContent || SAMPLE_DOCS.readme;
  renderMarkdown();

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('tab-' + tabId);
      if (target) target.classList.add('active');
    });
  });

  const syntaxSnippets = document.querySelectorAll('.syntax-code');
  syntaxSnippets.forEach(snippet => {
    snippet.addEventListener('click', () => {
      const text = snippet.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied: ' + text);
      });
    });
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
});
