<div align="center">

# Selector

**指向任意元素，告诉 AI 你想改什么。**

一个浏览器书签工具，让你可视化选取任意 DOM 元素，捕获 HTML 与计算样式，附加修改需求，然后导出结构化的 Markdown Prompt，直接喂给 AI 工具。

[![AI Prompt](https://img.shields.io/badge/AI-Prompt-7c3aed?logo=openai&logoColor=fff)](#输出示例)
[![DOM Snapshot](https://img.shields.io/badge/DOM-Snapshot-e34c26?logo=w3c&logoColor=fff)](#特性)
[![Style Inspector](https://img.shields.io/badge/Style-Inspector-fb8c00?logo=css3&logoColor=fff)](#特性)
[![Markdown](https://img.shields.io/badge/Output-Markdown-083fa1?logo=markdown&logoColor=fff)](#输出示例)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-runtime-fbf0df?logo=bun&logoColor=000)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

[English](../README.md) · [中文](./README.zh-CN.md)

<img src="../static/landing.png" alt="Selector — 落地页" width="680" />

</div>

---

## 为什么用 Selector？

手动复制 HTML 片段又慢又容易出错。Selector 把整个流程自动化：**可视化选取元素、为每个元素写下你想要的改动、把现成的 Prompt 粘贴到任何 AI 助手** —— Claude Code、Codex、Cursor、ChatGPT，或任意基于对话的工具。

无需扩展商店，无需权限，无需服务器。一个书签，任意页面可用。

## 演示

<img src="../static/use.gif" alt="Selector 实际效果 —— 选取元素并生成 Prompt" width="680" />

## 特性

- **一键安装** —— 把书签拖到书签栏即可（约 6 KB，零依赖）
- **可视化选取** —— 鼠标悬停高亮，点击选中，任意网页可用
- **多选** —— 用 `Shift+Click` 把多个元素装入同一个 Prompt
- **计算样式捕获** —— 过滤后的非默认样式，按组分类（layout / text / bg / border / effects）
- **HTML 快照** —— 简洁模式（仅自身）或完整模式（含子节点，自动截断长文本）
- **行内标注** —— 在编辑器中为每个元素直接写下修改需求
- **结构化 Markdown 输出** —— 选择器路径 + 样式 + HTML + 你的备注，复制即用
- **键盘优先** —— 方向键导航 DOM，`⌘C` / `Alt+C` 复制，`Space` 暂停，`Esc` 清空
- **Shadow DOM 隔离** —— UI 全部跑在 Open Shadow DOM 内，不会与宿主页面的 CSS/JS 冲突
- **移动端友好** —— 触控优化的浮动 UI，自适应布局
- **自托管** —— 单文件 IIFE，可部署到 GitHub Pages、CDN 或你自己的服务器

## 安装

1. 打开 [Selector 落地页](https://bb-boy680.github.io/dom-snapshot-ai/)
2. 把页面上的 **Selector** 按钮拖到浏览器书签栏

完成。在任意页面点击书签即可激活。

> [!TIP]
> 书签可在 `localhost`、内网测试地址、生产环境上正常工作 —— 兼容 React、Next.js、Vue、Svelte 或纯 HTML。无需安装浏览器扩展。

## 使用方式

### 基本流程

1. **激活** —— 在任意页面点击 Selector 书签
2. **选取** —— 悬停高亮元素，点击选中
3. **附加** —— 点击工具栏 "+ Attach" 按钮，把元素以 chip 形式提交到编辑器
4. **标注** —— 在 chip 旁边输入你的修改需求（例如 "把背景改成红色"）
5. **复制** —— 按 `⌘C` (macOS) 或 `Alt+C` (Windows) 复制结构化 Prompt
6. **粘贴** —— 粘贴到你常用的 AI 助手

### 快捷键

| 操作 | 快捷键 |
|---|---|
| 选取元素 | `Click` |
| 多选 | `Shift + Click` |
| 在 DOM 树中导航 | `←` `↑` `↓` `→` |
| 暂停 / 恢复悬停 | `Space` |
| 复制 Prompt | `⌘ C` / `Alt + C` |
| 清空 / 退出 | `Esc` |

### 输出示例

复制到剪贴板的 Prompt 长这样：

````markdown
# Element: <div class="product-card">
- **URL**: /shop/accessories

- **selector**: body > main > section > div.product-card

- **Modification Request**:
```text
Make the background red.
```

- **Computed Styles**:
```css
display: inline-flex;
padding: 8px 16px;
font-size: 14px;
color: #fff;
background-color: #007bff;
border-radius: 4px;
```

- **HTML (full)**:
```html
<div class="product-card">
  <h3>AirPods Pro</h3>
  <p class="price">From $269 · 3 colors</p>
  <span class="target-btn">Learn more</span>
</div>
```
````

## 架构

Selector 是一个使用 esbuild 打包、CSS 内联的单文件 IIFE。它在 `document.body` 挂载一个 `#__dom_snapshot_ai_root__` 宿主元素并附加 Open Shadow DOM —— 所有 UI 都跑在 Shadow DOM 内，与宿主页面完全隔离。

```
src/
├── index.ts            # 入口 —— 挂载、串联模块、卸载
├── styles.css          # 全部样式（构建时内联）
├── types.d.ts          # TypeScript 声明
├── core/
│   ├── store.ts        # 中心状态 + 发布订阅 + 事件总线
│   ├── interact.ts     # 页面级事件捕获（悬停 / 点击 / 键盘）
│   ├── markdown.ts     # Markdown Prompt 生成
│   ├── html-snapshot.ts    # HTML 捕获（简洁 / 完整）
│   ├── style-groups.ts     # 计算样式收集与分组
│   └── selector-path.ts    # CSS 选择器生成
└── ui/
    ├── toolbar.ts      # 浮动工具栏 + popcards（Edit / Style / HTML）
    ├── panel.ts        # Prompt 编辑面板（contenteditable + chips）
    └── draggable.ts    # 面板 / dock 拖拽与视口边界处理
```

关键设计决策：

- **原生 TypeScript，无框架** —— 注入到任意宿主页面时把体积压到最小
- **Shadow DOM 隔离** —— 避免 CSS/JS 冲突；事件通过 `composedPath()` 区分面板内外点击
- **两段式选取** —— 点击产生未提交的预览；点击 "Attach" 后才作为 chip 提交到编辑器
- **RAF 调度渲染** —— 工具栏在滚动 / 缩放时通过 `requestAnimationFrame` 重定位，避免抖动

## 开发

环境要求：[Bun](https://bun.sh/) >= 1.0

```bash
# 安装依赖
bun install

# 启动开发模式（watch）
bun run dev

# 生产构建（minified）
bun run build

# 类型检查
bun run typecheck

# Lint
bun run lint

# 运行测试
bun test

# 一站式检查（typecheck + lint + test）
bun run check
```

> [!NOTE]
> dev 命令本质就是 esbuild watch —— 源码改动会自动重建 `dist/selector.js`。用 VSCode Live Server 打开 `dist/index.html`（`http://127.0.0.1:5500/dist/index.html`），编辑后刷新即可。**不要让 Claude 自动运行 `bun run dev`** —— 由开发者自己启动。

### 本地预览

1. 运行 `bun run dev`
2. 通过 VSCode Live Server 打开 `dist/index.html`
3. 把页面上的 "Selector" 链接拖到书签栏
4. 在任意页面点击书签

### 自定义部署

生产环境下，`selector.js` 必须可以被任意宿主页访问到（书签内容在构建时把 URL 固化）：

```bash
SELECTOR_URL=https://bb-boy680.github.io/dom-snapshot-ai/selector.js bun run build
```

## 移动端

<img src="../static/mobile.png" alt="Selector 移动端 —— 触控优化 UI" width="320" />

Selector 的浮动 UI 针对触控设备做了适配：
- 最小 44×44px 触控目标
- 自适应工具栏定位（上 / 下 / 左右）
- 折叠 dock 贴边吸附，可滑出展开
- popcards 自动夹紧到视口范围

## License

MIT
