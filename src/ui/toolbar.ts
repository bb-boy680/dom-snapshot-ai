import {
  commitItem, emit, getElement, getState, getStyleGroups, setActive, setHtmlAttached,
  subscribe, uncommitItem, updateHtmlMode, updateNote, updateStyles,
} from '../core/store';
import { htmlSnapshot, type SnapshotMode } from '../core/html-snapshot';
import type { StyleGroupId, StyleProp } from '../core/style-groups';
import type { SelectionItem } from '../core/markdown';

type PopcardKind = 'edit' | 'style' | 'html';

interface UiState {
  popcard: PopcardKind | null;
  activeStyleGroup: StyleGroupId;
}

const ui: UiState = { popcard: null, activeStyleGroup: 'layout' };

const TOOLBAR_H = 32;
const TOOLBAR_GAP = 8;

// Persistent nodes & cached metadata so scroll/resize reposition without
// rebuilding the DOM (which causes the visible flicker).
interface MountedToolbar {
  itemId: string;
  toolbarEl: HTMLElement;
  cardEl: HTMLElement | null;
  cardKind: PopcardKind | null;
  cardHeight: number; // measured once when the card is first inserted
}

export function initToolbar(root: ShadowRoot): void {
  const layer = document.createElement('div');
  layer.setAttribute('data-dsai-toolbar', '');
  root.appendChild(layer);

  let mounted: MountedToolbar | null = null;
  let rafId = 0;

  const schedule = (): void => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      render(layer, mountedRef);
    });
  };

  // Indirection so the RAF callback always sees the latest mounted ref.
  const mountedRef = {
    get: () => mounted,
    set: (m: MountedToolbar | null) => { mounted = m; },
  };

  subscribe((s) => {
    if (!s.activeId) ui.popcard = null;
    schedule();
  });

  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
}

interface MountedRef {
  get: () => MountedToolbar | null;
  set: (m: MountedToolbar | null) => void;
}

function render(layer: HTMLDivElement, ref: MountedRef): void {
  const s = getState();
  const id = s.activeId;
  const item = id ? s.items.find((it) => it.id === id) ?? null : null;
  const el = id ? getElement(id) : null;

  if (!s.enabled || !id || !item || !el || !el.isConnected) {
    layer.replaceChildren();
    ref.set(null);
    return;
  }

  const rect = el.getBoundingClientRect();
  const placeAbove = rect.top >= TOOLBAR_H + TOOLBAR_GAP + 4;
  let mounted = ref.get();

  // Rebuild only when the selection or card kind changes — never on scroll.
  const needToolbar = !mounted || mounted.itemId !== id;
  if (needToolbar) {
    layer.replaceChildren();
    const toolbarEl = buildToolbar(item);
    layer.appendChild(toolbarEl);
    mounted = { itemId: id, toolbarEl, cardEl: null, cardKind: null, cardHeight: 0 };
    ref.set(mounted);
  } else {
    // Same item, content might have changed (style count, attach state, …).
    updateToolbarContent(mounted!.toolbarEl, item);
  }

  // (Re)build the popcard only if the requested kind changed.
  const wantKind = ui.popcard;
  if (mounted!.cardKind !== wantKind) {
    if (mounted!.cardEl) mounted!.cardEl.remove();
    if (wantKind) {
      const card = buildPopcardEl(wantKind, item);
      layer.appendChild(card);
      // Synchronous measurement — done once, cached. Avoids the second-RAF
      // jump that caused the popcard to flash at top:0 during scroll.
      mounted!.cardEl = card;
      mounted!.cardHeight = card.offsetHeight;
      mounted!.cardKind = wantKind;
    } else {
      mounted!.cardEl = null;
      mounted!.cardKind = null;
      mounted!.cardHeight = 0;
    }
  } else if (mounted!.cardEl && wantKind) {
    // Same card kind, content may have changed (style chips, html mode).
    refreshCardBody(mounted!.cardEl, wantKind, item);
    mounted!.cardHeight = mounted!.cardEl.offsetHeight;
  }

  // Layout — runs every frame; cheap because we only mutate top/left.
  positionToolbar(mounted!.toolbarEl, rect, placeAbove);
  if (mounted!.cardEl) {
    const width = wantKind === 'style' ? 480 : 320;
    positionCard(mounted!.cardEl, rect, width, placeAbove, mounted!.cardHeight);
    alignArrow(mounted!.cardEl, mounted!.toolbarEl, wantKind!);
  }
}

function positionToolbar(tb: HTMLElement, rect: DOMRect, placeAbove: boolean): void {
  const top = placeAbove ? rect.top - (TOOLBAR_H + TOOLBAR_GAP) : rect.bottom + TOOLBAR_GAP;
  const left = Math.max(8, rect.left - 2);
  tb.style.top = `${top}px`;
  tb.style.left = `${left}px`;
}

function positionCard(card: HTMLElement, rect: DOMRect, width: number, toolbarAbove: boolean, cardH: number): void {
  let left = rect.left;
  const overflow = left + width - window.innerWidth + 12;
  if (overflow > 0) left -= overflow;
  card.style.left = `${Math.max(8, left)}px`;

  // Card defaults to below the element; toolbar (if same side) is jumped over.
  // Falls back to above when below doesn't fit.
  const tbBelowOffset = toolbarAbove ? 0 : TOOLBAR_H + TOOLBAR_GAP;
  const tbAboveOffset = toolbarAbove ? TOOLBAR_H + TOOLBAR_GAP : 0;
  const belowTop = rect.bottom + TOOLBAR_GAP + tbBelowOffset;
  const aboveTop = rect.top - TOOLBAR_GAP - tbAboveOffset - cardH;
  const fitsBelow = belowTop + cardH + 8 <= window.innerHeight;
  const placeBelow = fitsBelow || aboveTop < 8;

  if (placeBelow) {
    card.classList.remove('arrow-bottom');
    card.style.top = `${Math.min(window.innerHeight - cardH - 8, belowTop)}px`;
  } else {
    card.classList.add('arrow-bottom');
    card.style.top = `${Math.max(8, aboveTop)}px`;
  }
}

function buildToolbar(item: SelectionItem): HTMLElement {
  const tb = document.createElement('div');
  tb.className = 'toolbar';
  // top/left set by positionToolbar() each frame.
  renderToolbarInner(tb, item);

  tb.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>('.tb-btn');
    if (!btn || !tb.contains(btn)) return;
    e.stopPropagation();
    const act = btn.dataset.act as 'edit' | 'style' | 'html' | 'attach';
    if (act === 'attach') {
      if (item.committed) uncommitItem(item.id);
      else {
        commitItem(item.id);
        emit({ type: 'chip-insert-request', id: item.id });
      }
      return;
    }
    ui.popcard = ui.popcard === act ? null : act;
    // Trigger a render via store notify — cheap, hits the same RAF path as scroll.
    setActive(item.id);
  });
  tb.addEventListener('mousedown', (e) => {
    // Keep editor selection while clicking toolbar buttons.
    if ((e.target as Element | null)?.closest?.('.tb-btn')) e.preventDefault();
  });

  return tb;
}

function updateToolbarContent(tb: HTMLElement, item: SelectionItem): void {
  renderToolbarInner(tb, item);
}

function renderToolbarInner(tb: HTMLElement, item: SelectionItem): void {
  const attached = item.committed;
  const styleCount = item.styles.length;
  const styleTotal = getStyleGroups(item.id).reduce((s, g) => s + g.props.length, 0);
  tb.innerHTML = `
    <span class="tb-selector" title="${escapeAttr(item.selector)}">
      <span class="sel-dot${attached ? ' attached' : ''}"></span>${escapeHtml(item.label)}
    </span>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-btn-icon${ui.popcard === 'edit' ? ' is-active' : ''}${item.note.trim() ? ' has-note' : ''}" data-act="edit" title="Edit">
      <svg viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-7 7H3.5v-3l7-7zM9 4l3 3"/></svg>
    </button>
    <button class="tb-btn${ui.popcard === 'style' ? ' is-active' : ''}${styleCount > 0 ? ' has-note' : ''}" data-act="style">
      Style <span class="tb-sub">${styleCount}/${styleTotal}</span>
    </button>
    <button class="tb-btn${ui.popcard === 'html' ? ' is-active' : ''}${item.htmlAttached ? ' has-note' : ''}" data-act="html">
      HTML <span class="tb-sub">${item.htmlMode === 'simplified' ? 'Simplified' : 'Full'}</span>
    </button>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-attach${attached ? ' is-done' : ''}" data-act="attach">${attached ? '✓ Attached' : '+ Attach'}</button>
  `;
}

function buildPopcardEl(kind: PopcardKind, item: SelectionItem): HTMLElement {
  if (kind === 'edit')  return buildEditCard(item);
  if (kind === 'style') return buildStyleCard(item);
  return buildHtmlCard(item);
}

function refreshCardBody(card: HTMLElement, kind: PopcardKind, item: SelectionItem): void {
  const fresh = buildPopcardEl(kind, item);
  // Move children over so listeners attached to `card` (if any) stay alive,
  // but in practice listeners are on inner buttons which we rebuild — so we
  // simply swap the inner DOM.
  card.replaceChildren(...Array.from(fresh.childNodes));
  card.className = fresh.className; // preserve from-edit/from-style/from-html marker class
}

function alignArrow(card: HTMLElement, toolbar: HTMLElement, kind: PopcardKind): void {
  const btn = toolbar.querySelector<HTMLButtonElement>(`[data-act="${kind}"]`);
  if (!btn) return;
  const btnRect = btn.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  // Clamp so arrow stays well inside the card's rounded corners.
  const x = Math.max(16, Math.min(cardRect.width - 28, btnRect.left + btnRect.width / 2 - cardRect.left - 6));
  card.style.setProperty('--arrow-x', `${x}px`);
}

function buildEditCard(item: SelectionItem): HTMLElement {
  const card = document.createElement('div');
  card.className = 'popcard from-edit';
  card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">Modification</span>
      <span class="popcard-meta" title="${escapeAttr(item.selector)}">${escapeHtml(item.label)}</span>
    </div>
    <div class="edit-body">
      <textarea placeholder="描述你想对这个元素做的改动…">${escapeHtml(item.note)}</textarea>
    </div>
    <div class="edit-actions">
      <button class="ghost" data-act="cancel">Cancel</button>
      <button class="primary" data-act="save">Save</button>
    </div>
  `;
  const ta = card.querySelector('textarea') as HTMLTextAreaElement;
  card.querySelector<HTMLButtonElement>('[data-act="cancel"]')!.addEventListener('click', () => {
    ui.popcard = null;
    setActive(item.id);
  });
  card.querySelector<HTMLButtonElement>('[data-act="save"]')!.addEventListener('click', () => {
    updateNote(item.id, ta.value);
    ui.popcard = null;
    setActive(item.id);
  });
  return card;
}

function buildStyleCard(item: SelectionItem): HTMLElement {
  const groups = getStyleGroups(item.id);
  const activeId = ui.activeStyleGroup;
  const active = groups.find((g) => g.id === activeId) ?? groups[0];
  const selected = new Map(item.styles.map((p) => [p.k, p]));
  const totalProps = groups.reduce((s, g) => s + g.props.length, 0);
  const allOn = totalProps > 0 && item.styles.length === totalProps;

  const card = document.createElement('div');
  card.className = 'popcard from-style';
  card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">Computed Styles</span>
      <span class="popcard-meta">${item.styles.length} selected</span>
    </div>
    <div class="style-split">
      <div class="style-groups">
        ${groups.map((g) => {
          const sel = g.props.filter((p) => selected.has(p.k)).length;
          const hasSel = sel > 0 ? ' has-selection' : '';
          const isActive = g.id === active.id ? ' is-active' : '';
          return `<div class="style-group${isActive}${hasSel}" data-group="${g.id}">
            <span class="sg-name">${g.title}</span>
            <span class="sg-count">${sel}/${g.props.length}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="style-props">
        <div class="style-props-head">
          <span class="sp-title">${active.title} · ${active.props.length} properties</span>
          <button class="sp-toggle">${active.props.every((p) => selected.has(p.k)) && active.props.length ? 'Clear all' : 'Select all'}</button>
        </div>
        <div class="prop-chips">
          ${active.props.map((p) => {
            const on = selected.has(p.k);
            return `<label class="prop-chip${on ? ' is-on' : ''}">
              <input type="checkbox" data-key="${escapeAttr(p.k)}"${on ? ' checked' : ''}>
              ${p.swatch ? `<span class="prop-swatch" style="background:${escapeAttr(p.swatch)}"></span>` : ''}
              <span class="prop-key">${escapeHtml(p.k)}</span>
              <span class="prop-val">${escapeHtml(p.v)}</span>
            </label>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="style-footer">
      <label class="all-toggle">
        <input type="checkbox" data-act="all"${allOn ? ' checked' : ''}>
        All non-default styles
      </label>
      <span class="footer-meta">${item.styles.length} / ${totalProps} attached</span>
      <button class="add-btn" data-act="done">Done</button>
    </div>
  `;

  const lookup = new Map(groups.flatMap((g) => g.props.map((p) => [p.k, p] as const)));

  card.querySelectorAll<HTMLDivElement>('.style-group').forEach((g) => {
    g.addEventListener('click', () => {
      ui.activeStyleGroup = g.dataset.group as StyleGroupId;
      setActive(item.id);
    });
  });

  card.querySelectorAll<HTMLInputElement>('.prop-chip input').forEach((cb) => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.key!;
      const cur = [...selected.values()];
      const next: StyleProp[] = cb.checked
        ? [...cur, lookup.get(key)!].filter((p): p is StyleProp => !!p)
        : cur.filter((p) => p.k !== key);
      updateStyles(item.id, next);
    });
  });

  card.querySelector<HTMLButtonElement>('.sp-toggle')!.addEventListener('click', () => {
    const allOnNow = active.props.every((p) => selected.has(p.k)) && active.props.length > 0;
    const otherGroups = item.styles.filter((p) => !active.props.some((ap) => ap.k === p.k));
    const next = allOnNow ? otherGroups : [...otherGroups, ...active.props];
    updateStyles(item.id, next);
  });

  card.querySelector<HTMLInputElement>('[data-act="all"]')!.addEventListener('change', (e) => {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    const next: StyleProp[] = checked ? groups.flatMap((g) => g.props) : [];
    updateStyles(item.id, next);
  });

  card.querySelector<HTMLButtonElement>('[data-act="done"]')!.addEventListener('click', () => {
    ui.popcard = null;
    setActive(item.id);
  });

  return card;
}

function buildHtmlCard(item: SelectionItem): HTMLElement {
  const card = document.createElement('div');
  card.className = 'popcard from-html';
  card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">HTML Snapshot</span>
      <span class="popcard-meta" title="${escapeAttr(item.selector)}">${escapeHtml(item.label)}</span>
    </div>
    <p class="html-hint">选择把哪种 HTML 形式附加到 prompt。</p>
    <div class="html-tabs">
      <button class="html-tab${item.htmlMode === 'simplified' ? ' is-on' : ''}" data-mode="simplified">
        <span class="ht-label">Simplified</span>
        <span class="ht-desc">仅自身节点 · 不含子元素</span>
      </button>
      <button class="html-tab${item.htmlMode === 'full' ? ' is-on' : ''}" data-mode="full">
        <span class="ht-label">Full</span>
        <span class="ht-desc">含所有后代 · 文本截 100 字</span>
      </button>
    </div>
    <div class="html-code-wrap">
      <pre class="html-code">${highlightHtml(item.htmlSnap.html)}</pre>
    </div>
    <div class="html-footer">
      <span class="html-meta">${item.htmlSnap.lineCount} 行 · ${item.htmlSnap.charCount} 字符</span>
      <button class="html-attach${item.htmlAttached ? ' is-attached' : ''}" data-act="toggle">${item.htmlAttached ? 'Detach' : 'Attach to prompt'}</button>
    </div>
  `;

  card.querySelectorAll<HTMLButtonElement>('.html-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode as SnapshotMode;
      updateHtmlMode(item.id, mode);
    });
  });
  card.querySelector<HTMLButtonElement>('[data-act="toggle"]')!.addEventListener('click', () => {
    setHtmlAttached(item.id, !item.htmlAttached);
  });

  void htmlSnapshot;
  return card;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

// Lightweight HTML syntax highlighter for the snapshot preview.
// Splits the source into tag and text runs, then color-codes tag name,
// attribute names, and attribute string values inside each tag.
function highlightHtml(src: string): string {
  const TAG = /<\/?[A-Za-z][^>]*>/g;
  let out = '';
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG.exec(src))) {
    if (m.index > i) out += escapeHtml(src.slice(i, m.index));
    out += highlightTag(m[0]);
    i = m.index + m[0].length;
  }
  if (i < src.length) out += escapeHtml(src.slice(i));
  return out;
}

function highlightTag(tag: string): string {
  // Match opening "<" or "</", tag name, the rest of the attributes, and trailing ">" / "/>".
  const m = /^<(\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(tag);
  if (!m) return escapeHtml(tag);
  const [, slash, name, attrs, selfClose] = m;
  const attrPart = highlightAttrs(attrs);
  return `<span class="html-punct">&lt;${slash}</span>`
    + `<span class="html-tag">${escapeHtml(name)}</span>`
    + attrPart
    + `<span class="html-punct">${selfClose ? '/' : ''}&gt;</span>`;
}

function highlightAttrs(raw: string): string {
  // key="value", key='value', key=value, or bare key.
  const ATTR = /(\s+)([A-Za-z_:][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`<>=]+)?/g;
  let out = '';
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR.exec(raw))) {
    if (m.index > i) out += escapeHtml(raw.slice(i, m.index));
    const [, ws, key, eq, val] = m;
    out += escapeHtml(ws);
    out += `<span class="html-attr">${escapeHtml(key)}</span>`;
    if (eq && val !== undefined) {
      out += escapeHtml(eq);
      const isString = /^["']/.test(val);
      out += isString
        ? `<span class="html-str">${escapeHtml(val)}</span>`
        : `<span class="html-val">${escapeHtml(val)}</span>`;
    } else if (eq) {
      out += escapeHtml(eq);
    }
    i = m.index + m[0].length;
  }
  if (i < raw.length) out += escapeHtml(raw.slice(i));
  return out;
}
