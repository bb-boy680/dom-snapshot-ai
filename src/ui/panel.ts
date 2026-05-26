import {
  getElement, getState, onBus, removeItem, setActive, setEnabled,
  setPanelCollapsed, subscribe, type BusEvent,
} from '../core/store';
import type { SelectionItem, Segment } from '../core/markdown';
import { buildMarkdown } from '../core/markdown';
import { groupStyle, type StyleGroupId } from '../core/style-groups';
import {
  applyDockPos, applyPanelPos, makeDockDraggable, makePanelDraggable,
  readDockPos, readPanelPos,
} from './draggable';

const SHORTCUTS: Array<[string, string]> = [
  ['Click', 'Select'],
  ['⇧', 'Multi'],
  ['←↑↓→', 'Navigate'],
  ['Space', 'Pause'],
  ['⌘C', 'Copy'],
  ['Esc', 'Clear'],
];

export function renderPanel(root: ShadowRoot, onClose: () => void): () => void {
  const layer = document.createElement('div');
  root.appendChild(layer);

  let toastState: null | { kind: 'success' | 'error'; text: string } = null;
  let toastTimer = 0;

  // The single mounted editor controller; lives across re-renders.
  let editor: EditorController | null = null;
  let chromeEl: HTMLElement | null = null;
  let dockEl: HTMLElement | null = null;

  const showToast = (kind: 'success' | 'error', text: string): void => {
    toastState = { kind, text };
    repaint();
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastState = null;
      repaint();
    }, 1800);
  };

  const repaint = (): void => {
    const s = getState();
    if (!s.panelOpen) {
      layer.innerHTML = '';
      chromeEl = null;
      dockEl = null;
      editor?.unmount();
      editor = null;
      return;
    }
    if (s.panelCollapsed) {
      // Keep chip meta in sync even while collapsed, so reopening shows current state.
      editor?.syncFromStore(s.items);
      if (chromeEl) { chromeEl.style.display = 'none'; }
      renderDock();
      renderToast();
      return;
    }
    // expanded mode
    if (dockEl) { dockEl.remove(); dockEl = null; }
    if (!chromeEl) renderChrome();
    else chromeEl.style.display = '';
    // reflect enabled/paused state
    const panel = chromeEl!;
    panel.classList.toggle('is-paused', !s.enabled);
    const editorEl = panel.querySelector<HTMLDivElement>('.panel-editor');
    if (editorEl) editorEl.contentEditable = s.enabled ? 'true' : 'false';
    const titleEl = panel.querySelector<HTMLDivElement>('.panel-title');
    if (titleEl) titleEl.childNodes[titleEl.childNodes.length - 1].textContent = s.enabled ? 'Selecting' : 'Paused';
    // sync per-chip data after chrome exists
    editor?.syncFromStore(s.items);
    updateFooterCount(s.items.filter((it) => it.committed).length);
    renderToast();
  };

  function renderChrome(): void {
    chromeEl = document.createElement('div');
    chromeEl.className = 'panel-root';
    chromeEl.innerHTML = `
      <div class="panel-titlebar">
        <div class="panel-title"><span class="status-dot"></span>Selecting</div>
        <div class="panel-ctrls">
          <button data-act="min" title="Minimize">
            <svg viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <button data-act="close" title="Close">
            <svg viewBox="0 0 12 12"><line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      <div class="panel-shortcuts">
        ${SHORTCUTS.map(([k, l]) => `<span class="kbd-group"><span class="kbd">${escapeHtml(k)}</span>${escapeHtml(l)}</span>`).join('')}
      </div>
      <div class="panel-editor-wrap">
        <div class="panel-editor" contenteditable="true" data-placeholder="Click an element on the page, then Attach from the toolbar to embed a chip at the cursor…"></div>
      </div>
      <div class="panel-footer">
        <button class="copy-btn" data-act="copy" disabled>Copy Prompt</button>
      </div>
    `;
    layer.appendChild(chromeEl);

    const titlebar = chromeEl.querySelector<HTMLDivElement>('.panel-titlebar')!;
    makePanelDraggable(chromeEl, titlebar);
    // Restore position after layout has measured the panel.
    requestAnimationFrame(() => applyPanelPos(chromeEl!, readPanelPos()));

    const editorEl = chromeEl.querySelector<HTMLDivElement>('.panel-editor')!;
    editor = new EditorController(editorEl);
    editor.mount();

    chromeEl.querySelector<HTMLButtonElement>('[data-act="min"]')!.addEventListener('click', () => {
      setPanelCollapsed(true);
      setEnabled(false);
    });
    chromeEl.querySelector<HTMLButtonElement>('[data-act="close"]')!.addEventListener('click', () => {
      onClose();
    });
    chromeEl.querySelector<HTMLButtonElement>('[data-act="copy"]')!.addEventListener('click', () => {
      if (!editor) return;
      const segments = editor.serialize();
      const md = buildMarkdown(segments, getState().items);
      navigator.clipboard.writeText(md).then(
        () => showToast('success', 'Copied to clipboard'),
        () => showToast('error', 'Copy failed'),
      );
    });

    // Typing in the editor doesn't go through the store, so we have to refresh
    // the Copy button state ourselves whenever the editor's contents change.
    editorEl.addEventListener('input', () => {
      updateFooterCount(getState().items.filter((it) => it.committed).length);
    });
  }

  // Copy button lights up whenever the editor has *anything* to copy — either
  // a committed chip OR plain text the user typed.
  function updateFooterCount(_n: number): void {
    const btn = chromeEl?.querySelector<HTMLButtonElement>('[data-act="copy"]');
    if (!btn) return;
    const ready = editorHasContent();
    btn.textContent = 'Copy Prompt';
    btn.disabled = !ready;
    btn.classList.toggle('is-ready', ready);
  }

  function editorHasContent(): boolean {
    const el = chromeEl?.querySelector<HTMLDivElement>('.panel-editor');
    if (!el) return false;
    // Any chip node → ready. Otherwise check for non-whitespace text.
    if (el.querySelector('.tag')) return true;
    return (el.textContent ?? '').trim().length > 0;
  }

  function renderDock(): void {
    if (!dockEl) {
      dockEl = document.createElement('div');
      dockEl.className = 'dock-wrap';
      dockEl.innerHTML = `
        <button class="dock-icon" title="Expand DOM Snapshot">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5h12M3 9h12M3 13.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="13.5" cy="13.5" r="2.2" stroke="currentColor" stroke-width="1.4"/>
          </svg>
        </button>
      `;
      layer.appendChild(dockEl);
      const dockIcon = dockEl.querySelector<HTMLButtonElement>('.dock-icon')!;
      makeDockDraggable(dockIcon);
      requestAnimationFrame(() => applyDockPos(dockIcon, readDockPos()));
      dockIcon.addEventListener('click', () => {
        setPanelCollapsed(false);
        setEnabled(true);
      });
    }
  }

  function renderToast(): void {
    const existing = layer.querySelector('.toast');
    if (existing) existing.remove();
    if (!toastState) return;
    const t = document.createElement('div');
    t.className = `toast ${toastState.kind === 'error' ? 'toast-error' : ''}`;
    t.innerHTML = toastState.kind === 'success'
      ? `<svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(toastState.text)}`
      : escapeHtml(toastState.text);
    layer.appendChild(t);
  }

  const unsubscribeStore = subscribe(repaint);
  const unsubscribeBus = onBus((e: BusEvent) => {
    if (e.type === 'chip-insert-request' && editor) {
      const item = getState().items.find((it) => it.id === e.id);
      if (item) editor.insertChip(item);
      // Chip insertion changes editor content but doesn't notify the store —
      // refresh the Copy button state ourselves.
      updateFooterCount(getState().items.filter((it) => it.committed).length);
    } else if (e.type === 'editor-clear' && editor) {
      editor.clearAll();
      updateFooterCount(0);
    } else if (e.type === 'copy-request' && editor) {
      // Handle keyboard shortcut copy request
      const segments = editor.serialize();
      const md = buildMarkdown(segments, getState().items);
      navigator.clipboard.writeText(md).then(
        () => showToast('success', 'Copied to clipboard'),
        () => showToast('error', 'Copy failed'),
      );
    }
  });

  return () => {
    unsubscribeStore();
    unsubscribeBus();
    window.clearTimeout(toastTimer);
    editor?.unmount();
    editor = null;
    layer.remove();
  };
}

// -----------------------------------------------------------------
// Editor controller — placeholder shell. Fully implemented in Task 5.
// -----------------------------------------------------------------
class EditorController {
  private chipMap = new Map<string, HTMLElement>();
  private savedRange: Range | null = null;
  private selectionHandler: (() => void) | null = null;

  constructor(private host: HTMLElement) {}

  // Selection inside a Shadow DOM is exposed via the shadowRoot's own getSelection()
  // (Chrome/Edge). Some engines fall back to document.getSelection() but then collapse
  // ranges at the shadow host. Try shadow first, then document.
  private getSelection(): Selection | null {
    const root = this.host.getRootNode();
    if (root instanceof ShadowRoot) {
      const shadowSel = (root as ShadowRoot & { getSelection?: () => Selection | null }).getSelection;
      if (typeof shadowSel === 'function') {
        const s = shadowSel.call(root);
        if (s) return s;
      }
    }
    return this.host.ownerDocument.getSelection();
  }

  mount(): void {
    // Track caret position whenever selection sits inside the editor. We can't rely on
    // `blur` because by the time it fires the selection has already moved away (e.g. user
    // clicked the toolbar Attach button), so anchorNode is no longer inside the host.
    const doc = this.host.ownerDocument;
    this.selectionHandler = (): void => {
      const sel = this.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      if (this.host.contains(r.startContainer)) {
        this.savedRange = r.cloneRange();
      }
    };
    doc.addEventListener('selectionchange', this.selectionHandler);
    this.host.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const x = target.closest<HTMLButtonElement>('.tag-x');
      if (x) {
        e.preventDefault();
        const tag = x.closest<HTMLElement>('.tag');
        const id = tag?.dataset.dsaiId;
        if (id) this.removeChip(id);
        return;
      }
      const tag = target.closest<HTMLElement>('.tag');
      const id = tag?.dataset.dsaiId;
      if (!id) return;
      e.preventDefault();
      setActive(id);
      getElement(id)?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    this.host.addEventListener('input', () => this.reconcileFromDom());
    this.host.addEventListener('mouseenter', (e) => {
      const tag = (e.target as Element | null)?.closest?.('.tag');
      if (!(tag instanceof HTMLElement)) return;
      const tt = tag.querySelector<HTMLElement>('.tag-tooltip');
      if (!tt) return;
      // Tooltips default to *above* the chip. Only flip them below when there
      // genuinely isn't room above — i.e. the chip's top is too close to the
      // viewport top, not the editor's top (the tooltip can escape the editor).
      const TOOLTIP_H = 140;
      const chipRect = tag.getBoundingClientRect();
      if (chipRect.top < TOOLTIP_H) {
        tt.classList.add('tooltip-below');
      } else {
        tt.classList.remove('tooltip-below');
      }
    }, true);
  }

  unmount(): void {
    if (this.selectionHandler) {
      this.host.ownerDocument.removeEventListener('selectionchange', this.selectionHandler);
      this.selectionHandler = null;
    }
    this.chipMap.clear();
    this.savedRange = null;
  }

  insertChip(item: SelectionItem): void {
    if (this.chipMap.has(item.id)) return;
    const chip = buildChipNode(item);
    const range = this.resolveInsertionRange();
    // Collapse the range first — if user had a selection, we want to *insert*, not replace.
    range.collapse(false);
    range.insertNode(chip);
    // Append a trailing space after the chip so the caret can land cleanly after it.
    const after = this.host.ownerDocument.createTextNode(' ');
    chip.parentNode!.insertBefore(after, chip.nextSibling);
    // Focus the editor so the new caret position is actually accepted by the browser.
    this.host.focus();
    const sel = this.getSelection();
    if (sel) {
      const r = this.host.ownerDocument.createRange();
      r.setStartAfter(after);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      this.savedRange = r.cloneRange();
    }
    this.chipMap.set(item.id, chip);
  }

  removeChip(id: string): void {
    const chip = this.chipMap.get(id);
    if (!chip) return;
    chip.remove();
    this.chipMap.delete(id);
    removeItem(id);
  }

  // Hard reset — wipe every chip and any free text the user typed, leaving the
  // editor empty (placeholder will reappear). Used by the global Esc shortcut.
  clearAll(): void {
    this.chipMap.clear();
    this.savedRange = null;
    this.host.replaceChildren();
  }

  patchChip(item: SelectionItem): void {
    const chip = this.chipMap.get(item.id);
    if (!chip) return;
    // Re-render chip inner content in place; preserve the host node so cursor isn't disturbed.
    chip.replaceChildren(...buildChipContent(item));
  }

  syncFromStore(items: SelectionItem[]): void {
    const byId = new Map(items.map((it) => [it.id, it]));
    // A chip should stay in the editor only while its item is still committed.
    // Uncommitting via the toolbar must remove the chip from the editor — the item
    // itself stays in the store so the toolbar can flip it back on.
    for (const [id, chip] of this.chipMap) {
      const item = byId.get(id);
      if (item && item.committed) this.patchChip(item);
      else { chip.remove(); this.chipMap.delete(id); }
    }
  }

  serialize(): Segment[] {
    const out: Segment[] = [];
    let stripLeading = false; // strip the nbsp we injected right after a chip
    this.host.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let v = node.textContent ?? '';
        if (stripLeading && v.length > 0 && (v[0] === ' ' || v[0] === ' ')) {
          v = v.slice(1);
        }
        stripLeading = false;
        // Normalize remaining nbsp back to a normal space so downstream markdown is clean.
        v = v.replaceAll(' ', ' ');
        if (v) out.push({ kind: 'text', value: v });
        return;
      }
      if (node instanceof HTMLElement) {
        if (node.tagName === 'BR') {
          out.push({ kind: 'text', value: '\n' });
          stripLeading = false;
          return;
        }
        if (node.classList.contains('tag') && node.dataset.dsaiId) {
          out.push({ kind: 'chip', id: node.dataset.dsaiId });
          stripLeading = true;
          return;
        }
        // Fall back to text content for unknown nodes (e.g. paste artifacts).
        const v = node.textContent ?? '';
        if (v) out.push({ kind: 'text', value: v });
        stripLeading = false;
      }
    });
    return out;
  }

  private resolveInsertionRange(): Range {
    const doc = this.host.ownerDocument;
    // Prefer the live selection if it is inside the editor.
    const sel = this.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (this.host.contains(r.startContainer)) return r;
    }
    if (this.savedRange && this.host.contains(this.savedRange.startContainer)) {
      return this.savedRange.cloneRange();
    }
    // Fallback: append at end.
    const r = doc.createRange();
    r.selectNodeContents(this.host);
    r.collapse(false);
    return r;
  }

  private reconcileFromDom(): void {
    const alive = new Set<string>();
    this.host.querySelectorAll<HTMLElement>('.tag[data-dsai-id]')
      .forEach((el) => { if (el.dataset.dsaiId) alive.add(el.dataset.dsaiId); });
    for (const id of [...this.chipMap.keys()]) {
      if (!alive.has(id)) {
        this.chipMap.delete(id);
        removeItem(id);
      }
    }
  }
}

function buildChipNode(item: SelectionItem): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'tag';
  span.contentEditable = 'false';
  span.dataset.dsaiId = item.id;
  span.title = item.selector;
  span.replaceChildren(...buildChipContent(item));
  return span;
}

function buildChipContent(item: SelectionItem): Node[] {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createTextNode(item.label));

  if (item.styles.length > 0) {
    const meta = document.createElement('span');
    meta.className = 'tag-meta';
    meta.title = `Style — ${item.styles.length} properties selected`;
    meta.innerHTML = `<svg viewBox="0 0 8 8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M1 2.5h6M1 4.5h6M1 6.5h4"/></svg>${item.styles.length}`;
    frag.appendChild(meta);
  }
  if (item.htmlAttached) {
    const meta = document.createElement('span');
    meta.className = 'tag-meta';
    meta.title = `HTML ${item.htmlMode}`;
    meta.textContent = item.htmlMode === 'simplified' ? 'HTML·S' : 'HTML·F';
    frag.appendChild(meta);
  }

  const x = document.createElement('button');
  x.className = 'tag-x';
  x.title = 'Remove';
  x.innerHTML = `<svg viewBox="0 0 8 8"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" stroke-width="1.4"/><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" stroke-width="1.4"/></svg>`;
  frag.appendChild(x);

  frag.appendChild(buildTooltip(item));
  return [...frag.childNodes];
}

function buildTooltip(item: SelectionItem): HTMLElement {
  const tt = document.createElement('span');
  tt.className = 'tag-tooltip';
  const styleRow = item.styles.length
    ? `<span class="tt-val">${renderStylePills(item.styles)}</span>`
    : `<span class="tt-val tt-empty">No properties selected</span>`;
  const htmlRow = item.htmlAttached
    ? `<span class="tt-val">${item.htmlMode} · ${item.htmlSnap.lineCount} lines · ${item.htmlSnap.charCount}B</span>`
    : `<span class="tt-val tt-empty">No HTML attached</span>`;
  const noteRow = item.note.trim()
    ? `<span class="tt-val">${escapeHtml(item.note.trim()).slice(0, 60)}</span>`
    : `<span class="tt-val tt-empty">No changes</span>`;
  tt.innerHTML = `
    <div class="tt-row"><span class="tt-key">Selector</span><span class="tt-val">${escapeHtml(item.selector)}</span></div>
    <div class="tt-row"><span class="tt-key">Styles</span>${styleRow}</div>
    <div class="tt-row"><span class="tt-key">HTML</span>${htmlRow}</div>
    <div class="tt-row"><span class="tt-key">Edit</span>${noteRow}</div>
  `;
  return tt;
}

const GROUP_LABEL: Record<StyleGroupId, string> = {
  layout: 'Layout',
  text: 'Text',
  bg: 'Bg',
  border: 'Border',
  effects: 'Effects',
  other: 'Other',
};
const GROUP_ORDER: StyleGroupId[] = ['layout', 'text', 'bg', 'border', 'effects', 'other'];

function renderStylePills(styles: SelectionItem['styles']): string {
  const counts: Partial<Record<StyleGroupId, number>> = {};
  for (const p of styles) {
    const g = groupStyle(p.k);
    counts[g] = (counts[g] ?? 0) + 1;
  }
  return GROUP_ORDER
    .filter((g) => counts[g])
    .map((g) => `<span class="tt-pill">${GROUP_LABEL[g]} ${counts[g]}</span>`)
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Exported only for unit tests; do not import from production code.
export { EditorController as __EditorController };
