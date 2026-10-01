import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { toPng, toBlob } from 'html-to-image';
import 'iconify-icon';
import './style.css';

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

const SAMPLE_CARDS: Record<string, string> = {
  tech: "# \ud83d\udca1 Why 100% Client-Side Matters\n\nIn the era of AI, developer tools should respect your privacy:\n\n- **Zero Cloud Leakage**: Code & drafts stay in browser memory.\n- **Sub-millisecond Latency**: No round-trip to remote servers.\n- **Offline Capable**: Works anytime, anywhere.\n\n`\typescript\nconst isPrivate = document.processing === \"client-side\";\nconsole.log(\"Safe:\", isPrivate); // true\n`\n\n> \"Build tools that empower creators without compromising their trust.\"",
  quote: "# \ud83c\udf05 Daily Reflection\n\n> \"Simplicity is about subtracting the obvious and adding the meaningful.\"\n> \n> \u2014 John Maeda, *The Laws of Simplicity*\n\nFocus on what moves the needle today. Delete what doesn't matter.",
  changelog: "# \ud83d\ude80 MDPreview v1.2 Release\n\nExcited to introduce two brand-new creative utilities:\n\n- \ud83d\udcc4 **PDF to MD**: Instant local PDF extraction into clean Markdown.\n- \ud83c\udfa8 **MD to Card**: Turn Markdown snippets into stunning social cards.\n- \ud83c\udf13 **4 Refined Themes**: High-contrast, dark mode & sepia.\n\n*100% Open-Source & Privacy-First.*"
};

document.addEventListener('DOMContentLoaded', () => {
  const cardEditor = document.getElementById('cardEditor') as HTMLTextAreaElement;
  const cardContent = document.getElementById('cardContent') as HTMLElement;
  const cardElement = document.getElementById('cardElement') as HTMLElement;
  const cardWrapper = document.getElementById('cardWrapper') as HTMLElement;

  const inputAuthorName = document.getElementById('inputAuthorName') as HTMLInputElement;
  const inputAuthorHandle = document.getElementById('inputAuthorHandle') as HTMLInputElement;
  const displayAuthorName = document.getElementById('displayAuthorName');
  const displayAuthorHandle = document.getElementById('displayAuthorHandle');
  const displayAuthorAvatar = document.getElementById('displayAuthorAvatar') as HTMLElement;

  const toggleDate = document.getElementById('toggleDate') as HTMLInputElement;
  const displayDate = document.getElementById('displayDate');
  const toggleWatermark = document.getElementById('toggleWatermark') as HTMLInputElement;
  const displayWatermark = document.getElementById('displayWatermark');

  const selectTheme = document.getElementById('selectTheme') as HTMLSelectElement;
  const selectRatio = document.getElementById('selectRatio') as HTMLSelectElement;
  const selectFont = document.getElementById('selectFont') as HTMLSelectElement;
  const selectPadding = document.getElementById('selectPadding') as HTMLSelectElement;

  const btnCopyCard = document.getElementById('btnCopyCard');
  const btnDownloadCard = document.getElementById('btnDownloadCard');
  const btnLoadEditorText = document.getElementById('btnLoadEditorText');
  const btnSampleTech = document.getElementById('btnSampleTech');
  const btnSampleQuote = document.getElementById('btnSampleQuote');
  const btnSampleChangelog = document.getElementById('btnSampleChangelog');
  const btnOpenViewer = document.getElementById('btnOpenViewer');

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

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  // Set today date
  if (displayDate) {
    const now = new Date();
    displayDate.textContent = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function renderCard() {
    if (!cardEditor || !cardContent) return;
    const raw = cardEditor.value;
    cardContent.innerHTML = marked.parse(raw) as string;

    // Syntax highlight code blocks
    cardContent.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
  }

  function updateMetadata() {
    if (displayAuthorName && inputAuthorName) {
      displayAuthorName.textContent = inputAuthorName.value || '糖糖it';
    }
    if (displayAuthorHandle && inputAuthorHandle) {
      displayAuthorHandle.textContent = inputAuthorHandle.value || '@tangtang-it';
    }
    if (displayAuthorAvatar && inputAuthorName) {
      const initial = (inputAuthorName.value.trim()[0] || 'T').toUpperCase();
      displayAuthorAvatar.textContent = initial;
    }
    if (displayDate && toggleDate) {
      displayDate.style.display = toggleDate.checked ? 'inline-block' : 'none';
    }
    if (displayWatermark && toggleWatermark) {
      displayWatermark.style.display = toggleWatermark.checked ? 'flex' : 'none';
    }
  }

  function applyCardStyles() {
    if (!cardWrapper || !cardElement) return;

    // Apply theme
    const theme = selectTheme ? selectTheme.value : 'minimal';
    cardWrapper.className = 'card-export-wrapper theme-' + theme;
    cardElement.className = 'social-card card-style-' + theme;

    // Apply ratio
    const ratio = selectRatio ? selectRatio.value : 'auto';
    cardElement.setAttribute('data-ratio', ratio);

    // Apply font
    const font = selectFont ? selectFont.value : 'sans';
    cardElement.setAttribute('data-font', font);

    // Apply padding
    const padding = selectPadding ? selectPadding.value : 'normal';
    cardElement.setAttribute('data-padding', padding);
  }

  // Load initial content: either from editor localStorage or default tech sample
  const savedEditorContent = localStorage.getItem('mdpreview_content');
  if (savedEditorContent && savedEditorContent.trim()) {
    cardEditor.value = savedEditorContent;
  } else {
    cardEditor.value = SAMPLE_CARDS.tech;
  }

  cardEditor.addEventListener('input', renderCard);

  inputAuthorName?.addEventListener('input', updateMetadata);
  inputAuthorHandle?.addEventListener('input', updateMetadata);
  toggleDate?.addEventListener('change', updateMetadata);
  toggleWatermark?.addEventListener('change', updateMetadata);

  selectTheme?.addEventListener('change', applyCardStyles);
  selectRatio?.addEventListener('change', applyCardStyles);
  selectFont?.addEventListener('change', applyCardStyles);
  selectPadding?.addEventListener('change', applyCardStyles);

  btnSampleTech?.addEventListener('click', () => {
    cardEditor.value = SAMPLE_CARDS.tech;
    renderCard();
    showToast('Loaded Tech Sample');
  });

  btnSampleQuote?.addEventListener('click', () => {
    cardEditor.value = SAMPLE_CARDS.quote;
    renderCard();
    showToast('Loaded Quote Sample');
  });

  btnSampleChangelog?.addEventListener('click', () => {
    cardEditor.value = SAMPLE_CARDS.changelog;
    renderCard();
    showToast('Loaded Changelog Sample');
  });

  btnLoadEditorText?.addEventListener('click', () => {
    const text = localStorage.getItem('mdpreview_content');
    if (text && text.trim()) {
      cardEditor.value = text;
      renderCard();
      showToast('Imported text from Viewer');
    } else {
      showToast('No saved content in Viewer yet');
    }
  });

  btnOpenViewer?.addEventListener('click', () => {
    localStorage.setItem('mdpreview_content', cardEditor.value);
    window.location.href = '/';
  });

  // Export as Image
  async function exportCardImage(action: 'copy' | 'download') {
    if (!cardWrapper) return;

    try {
      showToast('Generating high-res card...');
      
      const options = {
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'none'
        }
      };

      if (action === 'download') {
        const dataUrl = await toPng(cardWrapper, options);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'md-card-' + Date.now() + '.png';
        a.click();
        showToast('Card image downloaded!');
      } else {
        const blob = await toBlob(cardWrapper, options);
        if (!blob) throw new Error('Failed to generate image blob');
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Card image copied to clipboard!');
      }
    } catch (err: any) {
      console.error('Failed to export card image:', err);
      // Fallback: if clipboard write failed (due to permissions), offer download
      if (action === 'copy') {
        try {
          const dataUrl = await toPng(cardWrapper, { pixelRatio: 2 });
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'md-card-' + Date.now() + '.png';
          a.click();
          showToast('Clipboard write restricted. Downloaded PNG instead!');
        } catch (e: any) {
          alert('Failed to generate card image: ' + (e.message || 'Unknown error'));
        }
      } else {
        alert('Failed to export image: ' + (err.message || 'Unknown error'));
      }
    }
  }

  btnCopyCard?.addEventListener('click', () => exportCardImage('copy'));
  btnDownloadCard?.addEventListener('click', () => exportCardImage('download'));

  // Initial runs
  updateMetadata();
  applyCardStyles();
  renderCard();
});
