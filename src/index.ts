import css from './styles.css' with { type: 'text' };
import { renderPanel } from './ui/panel';
import { initToolbar } from './ui/toolbar';
import { initInteract } from './core/interact';
import { clearAll } from './core/store';

const MOUNT_ID = '__dom_snapshot_ai_root__';

function mount(): void {
  if (document.getElementById(MOUNT_ID)) return;

  const host = document.createElement('div');
  host.id = MOUNT_ID;
  document.body.appendChild(host);

  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);

  let teardown = (): void => {};

  const disposePanel = renderPanel(root, () => teardown());
  const disposeToolbar = initToolbar(root);
  const disposeInteract = initInteract({ onSelect: () => {} });

  teardown = (): void => {
    disposeInteract();
    disposeToolbar();
    disposePanel();
    // Wipe selection state so a re-activation starts clean.
    clearAll();
    host.remove();
  };
}

mount();
