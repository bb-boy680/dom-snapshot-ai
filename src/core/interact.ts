import { addElement, clearAll, emit, getElement, getState, setEnabled, setPanelCollapsed, subscribe } from './store';

export const HOST_ID = '__dom_snapshot_ai_root__';

export interface InteractCallbacks {
  onSelect: (el: Element, id: string) => void;
}

const MOUSE_EVENTS = ['mousedown', 'mouseup', 'click', 'contextmenu', 'dblclick', 'auxclick'] as const;
// Pointer events - intercept pointerdown to handle selection before setPointerCapture
const POINTER_CLICK_EVENTS = ['pointerdown'] as const;

export function initInteract(cb: InteractCallbacks): () => void {
  const hoverEl = makeOverlay({
    border: '1.5px dashed #0066cc',
    background: 'rgba(0, 102, 204, 0.045)',
  });
  const selectedEl = makeOverlay({
    border: '2px solid #0066cc',
    background: 'rgba(0, 102, 204, 0.055)',
    transition: 'none',
  });
  document.body.appendChild(selectedEl);
  document.body.appendChild(hoverEl);

  let bound = false;
  let disposed = false;

  const positionSelected = (): void => {
    const { activeId, enabled } = getState();
    const el = activeId ? getElement(activeId) : null;
    if (!el || !enabled) {
      selectedEl.style.display = 'none';
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(selectedEl.style, {
      display: 'block',
      left: `${r.left - 3}px`,
      top: `${r.top - 3}px`,
      width: `${r.width + 2}px`,
      height: `${r.height + 2}px`,
    });
  };

  const onMove = (e: MouseEvent | PointerEvent): void => {
    if (isFromPanel(e)) {
      hoverEl.style.display = 'none';
      return;
    }
    const el = pickEl(e.clientX, e.clientY);
    const activeEl = getElement(getState().activeId ?? '');
    if (!el || el === activeEl) {
      hoverEl.style.display = 'none';
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(hoverEl.style, {
      display: 'block',
      left: `${r.left - 2}px`,
      top: `${r.top - 2}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
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
    hoverEl.style.display = 'none';
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
      hoverEl.style.display = 'none';
      selectedEl.style.display = 'none';
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

  const onScroll = (): void => positionSelected();

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
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
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
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', onScroll);
    hoverEl.style.display = 'none';
    selectedEl.style.display = 'none';
  };

  const reactToEnabled = (): void => {
    const { enabled } = getState();
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
    positionSelected();
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
    hoverEl.remove();
    selectedEl.remove();
    setPanelCollapsed(false);
  };
}

function makeOverlay(extra: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('data-dsai-overlay', '');
  Object.assign(el.style, {
    position: 'fixed',
    pointerEvents: 'none',
    borderRadius: '4px',
    zIndex: '2147483646',
    transition: 'all 60ms ease-out',
    display: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  Object.assign(el.style, extra);
  return el;
}

function pickEl(x: number, y: number): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el.id === HOST_ID) continue;
    if (el.closest(`#${HOST_ID}`)) continue;
    if (el.hasAttribute('data-dsai-overlay')) continue;
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
