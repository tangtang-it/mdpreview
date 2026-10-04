# MdPreview

<p align="center">
  <a href="https://mdpreview.dev">
    <img src="https://img.shields.io/badge/Status-Active_&_Live-success?style=flat-square" alt="Status: Active" />
  </a>
  <a href="https://mdpreview.dev">
    <img src="https://img.shields.io/badge/Live_Site-mdpreview.dev-blue?style=flat-square" alt="Website" />
  </a>
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License: MIT" /></a>
</p>

<p align="center">
  <strong>The modern, privacy-first Markdown workstation and visual rendering suite.</strong><br/>
  Real-time split preview, math formula rendering (KaTeX), social card generation, and local PDF conversion.
</p>

<p align="center">
  <a href="https://mdpreview.dev"><strong>Official Web App</strong></a> &bull;
  <a href="https://mdpreview.dev/md-to-card.html"><strong>Markdown to Card</strong></a> &bull;
  <a href="https://mdpreview.dev/pdf-to-md.html"><strong>PDF to Markdown</strong></a> &bull;
  <a href="#features"><strong>Key Features</strong></a> &bull;
  <a href="https://github.com/tangtang-it/mdpreview/issues"><strong>Feedback</strong></a>
</p>

---

## Overview

**MdPreview** is crafted for creators, technical writers, and indie developers who demand speed, aesthetic output, and zero privacy compromises.

Traditional online Markdown editors often upload documents to cloud servers, risking sensitive data leakage, or provide mediocre typography. MdPreview is designed from the ground up to run **100% locally in your browser**, ensuring your documents, drafts, and confidential notes never leave your device.

[Launch App: https://mdpreview.dev](https://mdpreview.dev)

---

## Features

- **Instant Real-time Preview**: Zero-latency split-pane editing powered by modern browser standards.
- **100% Privacy-First Architecture**: All parsing, rendering, and media operations run entirely client-side. Zero telemetry on your text.
- **Full KaTeX Math & Syntax Highlighting**: First-class support for LaTeX math equations, code blocks with automatic syntax highlighting, tables, and task lists.
- **Markdown to Social Card Generator**: Turn technical snippets, quotes, or thoughts into share-ready visual cards with custom backgrounds, fonts, and aspect ratios (optimized for Twitter/X, Xiaohongshu, and WeChat).
- **Client-side PDF to Markdown**: Convert local PDF documents into clean, structured Markdown directly in the browser using WebAssembly and Web Workers.
- **Multi-language Native Support**: Available in English, Spanish (Espanol), and Portuguese (Portugues).

---

## Tech Stack & Philosophy

- **Core**: TypeScript, Vite
- **Markdown & Math**: Marked, KaTeX, highlight.js
- **Media Processing**: html-to-image, pdfjs-dist
- **Design Philosophy**: Minimalist, fast-loading, zero backend dependency for end-user data processing.

---

## Roadmap

- [x] High-performance split editor
- [x] Social Card Generation with customizable themes
- [x] Offline client-side PDF to Markdown parser
- [ ] Export to Word / Clean HTML / EPUB
- [ ] Custom CSS themes for card export
- [ ] Chrome / Edge Browser Extension

---

## Community & Feedback

Found a bug or have an idea for a feature? We'd love to hear from you:

- **Issue Tracker**: [GitHub Issues](https://github.com/tangtang-it/mdpreview/issues)
- **Official Website**: [https://mdpreview.dev](https://mdpreview.dev)

---

## License

This repository and documentation are distributed under the [MIT License](LICENSE).
Copyright (c) 2026 tangtang-it. All rights reserved.