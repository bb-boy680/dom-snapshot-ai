# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@DESIGN.md

## Project Overview

A browser-based DOM snapshot + AI prompt generator. Users activate a floating inspection mode on any webpage, click to select DOM elements, capture their HTML and computed styles, attach modification requests, and export structured Markdown prompts for use with AI tools.

Distribution form: a single bookmarklet — `dist/selector.js` is wrapped into a `javascript:` URL by the build step (see `scripts/build.ts`). Everything ships as one IIFE with CSS inlined via `import css from './styles.css' with { type: 'text' }`. There is no framework — vanilla TS + DOM APIs, by design, to minimize footprint when injected into arbitrary host pages.

## Commands

```bash
bun install
bun run dev        # esbuild watch → dist/selector.js + dist/index.html
bun run build      # production build (--minify)
bun test           # bun test under tests/, happy-dom registered globally via tests/setup.ts
bun test tests/core/store.test.ts   # run a single test file
bun run typecheck  # tsc --noEmit
bun run lint       # ESLint with typescript-eslint type-checked rules
bun run check      # typecheck + lint + test
```

**Development workflow**: the user runs `bun run dev` themselves to start esbuild watch mode, which auto-rebuilds `dist/` on source changes. Do NOT run `bun run dev` or `bun run build` automatically — the watch process is already running and will pick up edits. After changing source files, just save and refresh the browser.

Local preview: open `dist/index.html` via VSCode Live Server (`http://127.0.0.1:5500/dist/index.html`) and drag the page's "Selector" link into the bookmark bar.

For production hosting, the `selector.js` URL must be reachable from arbitrary host pages — bookmarklet content is captured at build time from `dist/selector.js`. To rebuild against a public URL: `SELECTOR_URL=https://your-domain.com/selector.js bun run build` (referenced by README; consumed in build/template flow).

## Architecture

### Injection model

`src/index.ts` mounts a single host element `#__dom_snapshot_ai_root__` on `document.body`, attaches an open Shadow DOM, and inlines `src/styles.css` inside it. All UI lives inside that Shadow DOM. The bookmarklet is idempotent — re-clicking is a no-op when the host already exists.

Three independent modules are wired in `mount()`:
- `initInteract({ onSelect })` — page-level event capture (hover/click on the host page)
- `initToolbar(root)` — floating toolbar that follows the active element
- `renderPanel(root, onClose)` — the prompt editor panel

Each returns its own `dispose` function; `teardown()` calls all three plus `clearAll()` and removes the host node.

### State: `src/core/store.ts`

A single mutable `state` object plus a `Set<Listener>`. Subscribers are notified on every mutation (`notify()`); UI modules re-render reactively. Two key separate maps live alongside state:
- `elementById: Map<string, Element>` — id → live DOM node (not in `state` because Elements aren't serializable / iterable shape data)
- `styleCache: Map<string, StyleGroupData[]>` — memoized `getComputedStyle` per id

Plus a tiny event bus (`emit` / `onBus`) for cross-module signals that aren't state: `chip-insert-request`, `editor-clear`, `copy-request`.

**Two-stage selection lifecycle**: clicking an element creates an *uncommitted* preview item (visible in toolbar, not yet a chip in the editor). Clicking the toolbar's "+ Attach" button calls `commitItem(id)` and emits `chip-insert-request` so the panel inserts a chip at the editor caret. `uncommitItem(id)` keeps the preview alive on the page but removes the chip from the editor. **Important**: every store mutation creates new item objects (`state.items = state.items.map(...)`) — UI handlers must not capture item references in closures; always re-read from `getState().items`.

When `addElement(el)` is called and there is an existing uncommitted item, it is dropped first so we never accumulate ghost previews.

### Interaction: `src/core/interact.ts`

Captures `mousedown`/`mouseup`/`click`/`contextmenu`/`dblclick`/`auxclick` and `pointerdown` at `window` capture phase to block host-page handlers. `pointerdown` uses `stopImmediatePropagation` only (no `preventDefault`) — calling preventDefault on pointer events cancels the compatibility mouse events that the toolbar inside our Shadow DOM still depends on. Mouse events use full `preventDefault + stopImmediatePropagation`.

`isFromPanel(e)` walks `e.composedPath()` looking for the host id — this is how we let events that originate inside the Shadow DOM (toolbar, panel) pass through unblocked.

`pickEl(x, y)` uses `elementsFromPoint` and skips the host, anything inside the host, anything with `data-dsai-toolbar`, plus `<html>` and `<body>`. Hover and selected states are signaled via `data-dsai-hover` / `data-dsai-selected` attributes; outline styles are injected as a separate `<style id="__dom_snapshot_ai_outline_style__">` on `document.head` (not in the Shadow DOM, because the outlines are on host-page elements).

Keyboard: `Escape` clears all (works even when editor focused); `Alt/⌘ + C` copies; `Space` toggles enabled; arrow keys navigate parent/child/siblings of the active element.

### Toolbar: `src/ui/toolbar.ts`

Floating toolbar above/below the active element, plus optional popcards (Edit / Style / HTML). Re-renders are RAF-scheduled and triggered by store changes, scroll, and resize. The DOM is **persisted across renders** — `MountedToolbar` caches `toolbarEl`, `cardEl`, `cardKind`, and a measured `cardHeight`. Position updates only mutate `top`/`left` to avoid the flicker that full rebuilds caused.

Popcard placement (`positionCard`): defaults below the element; jumps over the toolbar on the same side; falls back above when below doesn't fit; clamps to viewport with `arrow-bottom` class flipping the arrow direction.

### Panel: `src/ui/panel.ts`

Two visual modes driven by `state.panelCollapsed`: a full chrome (titlebar + shortcuts + editor + footer) and a small dock icon. The same `repaint()` handles both — when collapsed, chrome is hidden (not removed) so the editor controller and chip nodes stay alive.

`EditorController` owns a `contenteditable` div and:
- Tracks the caret via `selectionchange` (because `blur` fires too late — by the time the user clicks the toolbar's Attach button, anchorNode has already moved off the editor). Latest valid range is stashed in `savedRange`.
- Handles Shadow DOM selection: tries `shadowRoot.getSelection()` first (Chrome/Edge), falls back to `document.getSelection()`.
- `chipMap: Map<id, HTMLElement>` is the source of truth for live chips; `syncFromStore(items)` reconciles: still-committed → `patchChip`, dropped → detach via `detachChipNode`.
- `insertChip` appends a single trailing space text node after the chip so the caret can land cleanly. **`detachChipNode` must consume that space when removing** — otherwise repeated attach/detach cycles accumulate whitespace in the editor.
- `serialize()` walks child nodes producing a `Segment[]` (`{kind: 'text'}` or `{kind: 'chip', id}`) with `stripLeading` to drop the trailing-space artifact when the next text node starts with one.

### Output: `src/core/markdown.ts`

`buildMarkdown(segments, items)` consumes the editor's serialized segments and the store's items to produce the final clipboard text — the README has the canonical example output format.

### Snapshot & styles

- `src/core/html-snapshot.ts` — `htmlSnapshot(el, mode)` for `'simplified'` (self only, no children) and `'full'` (descendants with text truncation).
- `src/core/style-groups.ts` — collects `getComputedStyle` filtered to "meaningful non-default" properties, organized into groups: `layout`, `text`, `bg`, `border`, `effects`, `other`.
- `src/core/selector-path.ts` — generates a stable selector + short label per element.

## Design system

`DESIGN.md` is the canonical token file. YAML frontmatter (machine-readable: `colors`, `typography`, `rounded`, `spacing`, `components`) followed by markdown rationale. Refer to its "Iteration Guide" and "Do's and Don'ts" before changing UI.

Hard rules:
- Use `{token.refs}` everywhere — never inline hex values, font stacks, or spacing
- Single accent color: `{colors.primary}` (#0066cc Action Blue) for all interactive elements
- Body copy 17px (not 16px); headlines weight 600 (not 700), negative letter-spacing
- Exactly one drop-shadow allowed (`rgba(0, 0, 0, 0.22) 3px 5px 30px`), reserved for product imagery
- Button active state is `transform: scale(0.95)` system-wide
- No decorative gradients; no shadows on cards, buttons, or text
- Minimum touch target: 44×44px
- Font: SF Pro Display ≥19px / SF Pro Text <20px; Inter on non-Apple platforms

## Tests

Bun test runner with `@happy-dom/global-registrator` registered globally in `tests/setup.ts`. Tests cover `core/` modules end-to-end (store mutations, interact key/click flow, markdown serialization, selector generation, html snapshot) and a couple of UI controllers (`tests/ui/editor.test.ts`, `tests/ui/toolbar-detached.test.ts`). When fixing a bug, prefer adding a regression test under `tests/` matching the source layout.
