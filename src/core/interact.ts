import { addElement, clearAll, emit, getElement, getState, setEnabled, setPanelCollapsed, subscribe } from './store';

export const HOST_ID = '__dom_snapshot_ai_root__';

const HOVER_ATTR = 'data-dsai-hover';
const SELECTED_ATTR = 'data-dsai-selected';
const STYLE_ID = '__dom_snapshot_ai_outline_style__';

const OUTLINE_CSS = `
html.__dsai_active__, html.__dsai_active__ * { cursor: crosshair !important; }
[${HOVER_ATTR}] {
  outline: 1.5px dashed #0066cc !important;
  outline-offset: 2px !important;
  background-color: rgba(0, 102, 204, 0.045) !important;
}
[${SELECTED_ATTR}] {
  outline: 2px solid #0066cc !important;
  outline-offset: 3px !important;
  background-color: rgba(0, 102, 204, 0.055) !important;
}
`;

export interface InteractCallbacks {
  onSelect: (el: Element, id: string) => void;
}

const MOUSE_EVENTS = ['mousedown', 'mouseup', 'click', 'contextmenu', 'dblclick', 'auxclick'] as const;
// Pointer events - intercept pointerdown to handle selection before setPointerCapture
const POINTER_CLICK_EVENTS = ['pointerdown'] as const;

export function initInteract(cb: InteractCallbacks): () => void {
  injectOutlineStyle();

  let hoveredEl: Element | null = null;
  let selectedEl: Element | null = null;

  let bound = false;
  let disposed = false;

  const setHovered = (el: Element | null): void => {
    if (hoveredEl === el) return;
    if (hoveredEl) hoveredEl.removeAttribute(HOVER_ATTR);
    hoveredEl = el;
    if (el) el.setAttribute(HOVER_ATTR, '');
  };

  const setSelected = (el: Element | null): void => {
    if (selectedEl === el) return;
    if (selectedEl) selectedEl.removeAttribute(SELECTED_ATTR);
    selectedEl = el;
    if (el) el.setAttribute(SELECTED_ATTR, '');
  };

  const syncSelectedFromState = (): void => {
    const { activeId, enabled } = getState();
    const el = activeId && enabled ? getElement(activeId) ?? null : null;
    setSelected(el);
  };

  const onMove = (e: MouseEvent | PointerEvent): void => {
    if (isFromPanel(e)) {
      setHovered(null);
      return;
    }
    const el = pickEl(e.clientX, e.clientY);
    if (!el || el === selectedEl) {
      setHovered(null);
      return;
    }
    setHovered(el);
  };

  const blurPanelIfFocused = (): void => {
    // The panel lives in a Shadow DOM, so document.activeElement only sees the
    // shadow host; the real focused node is under host.shadowRoot.activeElement.
    const host = document.getElementById(HOST_ID);
    const root = host?.shadowRoot;
    const focused = root?.activeElement as HTMLElement | null;
    if (focused && typeof focused.blur === 'function') focused.blur();
  };

  const blocker = (e: MouseEvent | PointerEvent): void => {
    if (isFromPanel(e)) return;

    // For pointerdown: stop propagation only (no preventDefault) to prevent
    // host-page drag / setPointerCapture from stealing the gesture.
    // We must NOT call preventDefault() here because the Pointer Events spec
    // says that cancels compatibility mouse events (mousedown / click), which
    // the toolbar inside our Shadow DOM still relies on.
    if (e.type === 'pointerdown') {
      const el = pickEl(e.clientX, e.clientY);
      if (!el) return;
      e.stopImmediatePropagation();
      return;
    }

    // For mouse events: use preventDefault to block page interactions
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === 'mousedown') blurPanelIfFocused();
    if (e.type !== 'click') return;
    const el = pickEl(e.clientX, e.clientY);
    if (!el) return;
    const id = addElement(el, e.shiftKey);
    setHovered(null);
    cb.onSelect(el, id);
    if (e.shiftKey) {
      emit({ type: 'chip-insert-request', id });
    }
  };

  const onKey = (e: KeyboardEvent): void => {
    const hasMod = e.ctrlKey || e.metaKey || e.altKey;
    const inEditable = isEditableTarget(e.target);

    // Escape always wins — even when focus is inside the editor — because it's
    // the user's universal "get me out / clear everything" key. It also blurs
    // and empties the editor (handled by clearAll callers).
    if (e.key === 'Escape' && !hasMod) {
      e.preventDefault();
      clearAll();
      emit({ type: 'editor-clear' });
      setHovered(null);
      setSelected(null);
      blurPanelIfFocused();
      return;
    }

    // Copy shortcut works even when editor is focused: Alt+C on Windows, ⌘C on macOS
    if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      emit({ type: 'copy-request' });
      return;
    }

    // Anything else: if the user is typing in the panel / a host-page input,
    // let the keystroke pass through unchanged.
    if (inEditable) return;

    if (e.code === 'Space' && !hasMod) {
      e.preventDefault();
      setEnabled(!getState().enabled);
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown'
        || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      tryNavigate(e);
    }
  };

  const isEditableTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    if (target.closest(`#${HOST_ID}`)) return true;
    if (target instanceof HTMLElement && target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  };

  const tryNavigate = (e: KeyboardEvent): void => {
    if (isEditableTarget(e.target)) return;
    const id = getState().activeId;
    if (!id) return;
    const cur = getElement(id);
    if (!cur) return;
    let next: Element | null = null;
    if (e.key === 'ArrowUp') next = cur.parentElement;
    else if (e.key === 'ArrowDown') next = cur.firstElementChild;
    else if (e.key === 'ArrowLeft') next = cur.previousElementSibling;
    else if (e.key === 'ArrowRight') next = cur.nextElementSibling;
    if (!next || next === document.body || next === document.documentElement) return;
    e.preventDefault();
    addElement(next, false);
  };

  const bindCaptureListeners = (): void => {
    for (const t of MOUSE_EVENTS) {
      window.addEventListener(t, blocker as EventListener, { capture: true, passive: false });
    }
    // Also listen to pointer events for components that use Pointer Events API
    // (e.g., Radix UI dialogs with pointer capture)
    for (const t of POINTER_CLICK_EVENTS) {
      window.addEventListener(t, blocker as EventListener, { capture: true, passive: false });
    }
    window.addEventListener('mousemove', onMove as EventListener, true);
    window.addEventListener('pointermove', onMove as EventListener, true);
  };

  const unbindCaptureListeners = (): void => {
    for (const t of MOUSE_EVENTS) {
      window.removeEventListener(t, blocker as EventListener, { capture: true });
    }
    for (const t of POINTER_CLICK_EVENTS) {
      window.removeEventListener(t, blocker as EventListener, { capture: true });
    }
    window.removeEventListener('mousemove', onMove as EventListener, true);
    window.removeEventListener('pointermove', onMove as EventListener, true);
    setHovered(null);
  };

  const reactToEnabled = (): void => {
    const { enabled } = getState();
    document.documentElement.classList.toggle('__dsai_active__', enabled);
    if (enabled && !bound) {
      bindCaptureListeners();
      bound = true;
    } else if (!enabled && bound) {
      unbindCaptureListeners();
      bound = false;
    }
  };

  document.addEventListener('keydown', onKey, true);

  const unsubscribe = subscribe(() => {
    reactToEnabled();
    syncSelectedFromState();
  });

  reactToEnabled();

  return () => {
    if (disposed) return;
    disposed = true;
    if (bound) {
      unbindCaptureListeners();
      bound = false;
    }
    document.removeEventListener('keydown', onKey, true);
    unsubscribe();
    setHovered(null);
    setSelected(null);
    document.documentElement.classList.remove('__dsai_active__');
    removeOutlineStyle();
    setPanelCollapsed(false);
  };
}

function injectOutlineStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = OUTLINE_CSS;
  document.head.appendChild(style);
}

function removeOutlineStyle(): void {
  document.getElementById(STYLE_ID)?.remove();
}

function pickEl(x: number, y: number): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el.id === HOST_ID) continue;
    if (el.closest(`#${HOST_ID}`)) continue;
    if (el.hasAttribute('data-dsai-toolbar')) continue;
    if (el === document.documentElement || el === document.body) continue;
    return el;
  }
  return null;
}

export function isFromPanel(e: Event): boolean {
  const path = e.composedPath();
  for (const n of path) {
    if (n instanceof Element && n.id === HOST_ID) return true;
  }
  return false;
}
