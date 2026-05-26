import css from './styles.css' with { type: 'text' };
import { renderPanel } from './ui/panel';
import { initToolbar } from './ui/toolbar';
import { initInteract } from './core/interact';
import { clearAll } from './core/store';

const MOUNT_ID = '__dom_snapshot_ai_root__';

// Events that "outside-click detectors" (Element Plus, Antd, MUI overlays)
// listen for on document/body to decide whether to close. We swallow them
// at the host's bubble phase so they never reach document-level listeners.
// OMIT pointermove / pointerup — dragging depends on them reaching window.
const STOP_PROPAGATION_EVENTS = [
  'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'auxclick',
  'pointerdown', 'touchstart', 'touchend', 'focusin',
] as const;

function mount(): void {
  if (document.getElementById(MOUNT_ID)) return;

  const host = document.createElement('div');
  host.id = MOUNT_ID;
  document.documentElement.appendChild(host);

  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);

  // Stop propagation at the host's bubble phase: shadow-internal listeners
  // have already executed (capture + bubble inside the shadow root), so
  // the page's document-level outside-click detectors never see this event.
  const swallow = (e: Event): void => { e.stopPropagation(); };
  for (const t of STOP_PROPAGATION_EVENTS) {
    host.addEventListener(t, swallow);
  }

  let teardown = (): void => {};

  const disposePanel = renderPanel(root, () => teardown());
  const disposeToolbar = initToolbar(root);
  const disposeInteract = initInteract({ onSelect: () => {} });

  teardown = (): void => {
    disposeInteract();
    disposeToolbar();
    disposePanel();
    for (const t of STOP_PROPAGATION_EVENTS) {
      host.removeEventListener(t, swallow);
    }
    // Wipe selection state so a re-activation starts clean.
    clearAll();
    host.remove();
  };
}

mount();
