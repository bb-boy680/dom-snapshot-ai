import css from './styles.css' with { type: 'text' };
import { renderPanel } from './ui/panel';
import { initToolbar } from './ui/toolbar';
import { initInteract } from './core/interact';

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

  renderPanel(root);
  initToolbar(root);
  initInteract({ onSelect: () => {} });
}

mount();
