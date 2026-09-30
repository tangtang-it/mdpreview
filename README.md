# MDPreview (Markdown 预览工具)

> Instant, Beautiful Markdown Viewer & Live Editor in Your Browser.
> 专为全球开发者、技术作者及独立创作者打造的轻量、零延迟、高隐私纯前端 Markdown 实时预览工具。

---

## 🎯 项目核心定位与亮点

- **⚡ 极速实时渲染**：基于客户端 marked 与 highlight.js 解析，毫秒级同步双向滚动。
- **🔒 100% 数据隐私**：所有文件解析均在浏览器本地内存完成，零数据上云，彻底消除泄密风险。
- **🎨 完整 GFM 支持**：原生支持 GitHub Flavored Markdown 语法，包括表格、任务列表、代码块高亮及数学公式。
- **🌓 四大精选主题**：支持 GitHub Light、GitHub Dark、Sepia 护眼暖色与 Midnight 极客深色。
- **🌍 出海多语言独立矩阵**：内置英语 (`/`)、西班牙语 (`/es/`)、葡萄牙语 (`/pt/`) 独立物理子目录与 Hreflang 交叉矩阵。
- **📈 AdSense 合规体系**：内置关于我们 (`about.html`)、隐私政策 (`privacy.html`)、服务条款 (`terms.html`)、联系反馈 (`contact.html`) 与语法百科、FAQ 结构化微数据。

---

## 📁 目录架构说明

```text
MdPreview/
├── doc/
│   └── seo-research-and-project-roadmap.md   # 核心调研纪要、Google Ads出价与落地全景
├── es/
│   └── index.html                            # 西班牙语物理独立子目录
├── pt/
│   └── index.html                            # 葡萄牙语物理独立子目录
├── public/
│   ├── favicon.svg                           # 高清矢量 Logo
│   └── robots.txt                            # 爬虫索引与 Sitemap 指引
├── scripts/
│   └── generate-sitemap.mjs                  # 带 Hreflang 矩阵的自动化 Sitemap 脚本
├── src/
│   ├── main.ts                               # 编辑器核心交互、Marked 配置与状态管理
│   └── style.css                             # 现代响应式 CSS 与主题调色盘
├── about.html                                # 关于我们合规页
├── privacy.html                              # 隐私协议（含 AdSense Cookie 声明）
├── terms.html                                # 服务条款
├── contact.html                              # 联系与功能建议反馈页
├── index.html                                # 主站英文版（SEO 与核心工具入口）
├── package.json                              # 项目依赖配置
├── tsconfig.json                             # TypeScript 编译选项
└── vite.config.ts                            # 多入口打包配置
```

---

## 🚀 快速启动与构建

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动本地开发服务
```bash
pnpm run dev
```

### 3. 构建生产版本（含多语言子目录与 Sitemap 生成）
```bash
pnpm run build
```

---

## 📄 文档索引
查看完整 SEO 调研、长尾词矩阵与 AdSense 盈利模型：[doc/seo-research-and-project-roadmap.md](doc/seo-research-and-project-roadmap.md)
