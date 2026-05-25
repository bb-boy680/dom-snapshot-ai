import { describe, test, expect, beforeEach } from 'bun:test';
import { initToolbar } from '../../src/ui/toolbar';
import { addElement, clearAll, setActive } from '../../src/core/store';

describe('toolbar detached element', () => {
  let root: ShadowRoot;

  beforeEach(() => {
    document.body.innerHTML = '<main id="page"></main>';
    clearAll();
    const host = document.createElement('div');
    document.body.appendChild(host);
    root = host.attachShadow({ mode: 'open' });
  });

  test('renders nothing when the selected element is no longer in the DOM', () => {
    const page = document.getElementById('page')!;
    const target = document.createElement('button');
    page.appendChild(target);
    const id = addElement(target, true);
    setActive(id);
    initToolbar(root);
    // detach
    target.remove();
    // trigger a re-render via store update
    setActive(id);
    const layer = root.querySelector('[data-dsai-toolbar]');
    // toolbar should not render any chrome for a detached element
    expect(layer?.children.length ?? 0).toBe(0);
  });
});
