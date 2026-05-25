// Lightweight pointer-based dragging for the floating panel & dock icon.
// Persists position in localStorage so the user's chosen spot survives reloads.

const PANEL_KEY = '__dsai_panel_pos__';
const DOCK_KEY  = '__dsai_dock_pos__';

const EDGE_MARGIN = 8;          // keep windows at least this far from the viewport edge
const DOCK_SNAP_ANIM = 180;     // ms for the dock snap-back transition

export interface PanelPos { left: number; top: number; }
export interface DockPos  { side: 'left' | 'right'; top: number; }

// ---------- storage ----------------------------------------------------------

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch { return null; }
}
function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
}

export const readPanelPos = (): PanelPos | null => readJSON<PanelPos>(PANEL_KEY);
export const readDockPos  = (): DockPos  | null => readJSON<DockPos>(DOCK_KEY);

// ---------- panel: free-form drag, clamp to viewport -------------------------

export function applyPanelPos(panel: HTMLElement, pos: PanelPos | null): void {
  if (!pos) return;
  const { left, top } = clampPanel(panel, pos.left, pos.top);
  panel.style.left = `${left}px`;
  panel.style.top  = `${top}px`;
  panel.style.right  = 'auto';
  panel.style.bottom = 'auto';
}

export function makePanelDraggable(panel: HTMLElement, handle: HTMLElement): void {
  handle.style.cursor = 'grab';
  // Buttons inside the title bar must keep working — stop drag from starting on them.
  handle.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.button !== 0) return;
    e.preventDefault();

    const rect = panel.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;

    // Switch to absolute top/left for the duration of the drag.
    panel.style.left   = `${rect.left}px`;
    panel.style.top    = `${rect.top}px`;
    panel.style.right  = 'auto';
    panel.style.bottom = 'auto';
    handle.style.cursor = 'grabbing';

    const onMove = (ev: PointerEvent): void => {
      const { left, top } = clampPanel(panel, ev.clientX - offX, ev.clientY - offY);
      panel.style.left = `${left}px`;
      panel.style.top  = `${top}px`;
    };
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      handle.style.cursor = 'grab';
      writeJSON(PANEL_KEY, {
        left: parseFloat(panel.style.left),
        top:  parseFloat(panel.style.top),
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function clampPanel(panel: HTMLElement, left: number, top: number): PanelPos {
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const maxL = window.innerWidth  - w - EDGE_MARGIN;
  const maxT = window.innerHeight - h - EDGE_MARGIN;
  return {
    left: Math.max(EDGE_MARGIN, Math.min(maxL, left)),
    top:  Math.max(EDGE_MARGIN, Math.min(maxT, top)),
  };
}

// ---------- dock icon: drag + snap to nearest side ---------------------------

export function applyDockPos(dock: HTMLElement, pos: DockPos | null): void {
  // Default behaviour (no saved pos) keeps the CSS: right:0 + top:50% + translateY(-50%).
  if (!pos) return;
  placeDock(dock, pos.side, pos.top, false);
}

export function makeDockDraggable(dock: HTMLElement): void {
  dock.style.cursor = 'grab';
  const DRAG_THRESHOLD = 3; // px — anything shorter is treated as a click

  let pressing = false;
  let dragging = false;
  let startX = 0, startY = 0;
  let offX = 0, offY = 0;

  dock.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pressing = true;
    dragging = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = dock.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dock.setPointerCapture?.(e.pointerId);
  });

  dock.addEventListener('pointermove', (e) => {
    if (!pressing) return;
    if (!dragging) {
      // Wait until movement exceeds the threshold before committing to a drag,
      // so a plain click never mutates layout.
      if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
      dragging = true;
      const rect = dock.getBoundingClientRect();
      dock.style.transform  = 'none';
      dock.style.transition = 'none';
      dock.style.right      = 'auto';
      dock.style.top        = `${rect.top}px`;
      dock.style.left       = `${rect.left}px`;
      dock.style.cursor     = 'grabbing';
    }
    const w = dock.offsetWidth;
    const h = dock.offsetHeight;
    const left = Math.max(0, Math.min(window.innerWidth  - w, e.clientX - offX));
    const top  = Math.max(EDGE_MARGIN, Math.min(window.innerHeight - h - EDGE_MARGIN, e.clientY - offY));
    dock.style.left = `${left}px`;
    dock.style.top  = `${top}px`;
  });

  const finishDrag = (e: PointerEvent): void => {
    if (!pressing) return;
    pressing = false;
    dock.releasePointerCapture?.(e.pointerId);
    dock.style.cursor = 'grab';
    if (!dragging) return; // plain click — let the native click handler run
    const rect = dock.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const side: 'left' | 'right' = centerX < window.innerWidth / 2 ? 'left' : 'right';
    const top = Math.max(EDGE_MARGIN, Math.min(window.innerHeight - rect.height - EDGE_MARGIN, rect.top));
    placeDock(dock, side, top, true);
    writeJSON(DOCK_KEY, { side, top } satisfies DockPos);
  };
  dock.addEventListener('pointerup', finishDrag);
  dock.addEventListener('pointercancel', finishDrag);

  // Swallow the click that follows a real drag, so dragging doesn't also expand the panel.
  dock.addEventListener('click', (e) => {
    if (dragging) {
      e.stopImmediatePropagation();
      e.preventDefault();
      dragging = false;
    }
  }, true);
}

function placeDock(dock: HTMLElement, side: 'left' | 'right', top: number, animate: boolean): void {
  const w = dock.offsetWidth;
  const targetLeft = side === 'left' ? 0 : window.innerWidth - w;

  // Adjust the border-radius / border so the icon hugs whichever side it's on.
  if (side === 'left') {
    dock.style.borderRadius = '0 12px 12px 0';
    dock.style.borderLeft = '0';
    dock.style.borderRight = '';
  } else {
    dock.style.borderRadius = '12px 0 0 12px';
    dock.style.borderRight = '0';
    dock.style.borderLeft = '';
  }

  dock.style.transform = 'none';
  dock.style.right = 'auto';
  if (animate) {
    dock.style.transition = `left ${DOCK_SNAP_ANIM}ms cubic-bezier(.2,.8,.2,1), top ${DOCK_SNAP_ANIM}ms cubic-bezier(.2,.8,.2,1)`;
    requestAnimationFrame(() => {
      dock.style.left = `${targetLeft}px`;
      dock.style.top  = `${top}px`;
    });
    window.setTimeout(() => { dock.style.transition = ''; }, DOCK_SNAP_ANIM + 40);
  } else {
    dock.style.left = `${targetLeft}px`;
    dock.style.top  = `${top}px`;
  }
}
