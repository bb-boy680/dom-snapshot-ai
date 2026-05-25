import { describe, test, expect, beforeEach } from 'bun:test';
import { initInteract } from '../../src/core/interact';
import { addElement, clearAll, getElement, getState } from '../../src/core/store';

describe('interact arrow-key navigation', () => {
  let dispose: () => void;

  beforeEach(() => {
    document.body.innerHTML = `
      <section id="root">
        <div id="parent">
          <p id="child-a">A</p>
          <p id="child-b">B</p>
          <p id="child-c">C</p>
        </div>
      </section>
    `;
    clearAll();
    dispose = initInteract({ onSelect: () => {} });
  });

  function press(key: string): void {
    const evt = new KeyboardEvent('keydown', { key, bubbles: true });
    document.dispatchEvent(evt);
  }

  test('ArrowUp moves activeId to parent', () => {
    const child = document.getElementById('child-b')!;
    addElement(child, false);
    press('ArrowUp');
    const activeEl = getElement(getState().activeId ?? '');
    expect(activeEl?.id).toBe('parent');
    dispose();
  });

  test('ArrowDown moves activeId to firstElementChild', () => {
    const parent = document.getElementById('parent')!;
    addElement(parent, false);
    press('ArrowDown');
    const activeEl = getElement(getState().activeId ?? '');
    expect(activeEl?.id).toBe('child-a');
    dispose();
  });

  test('ArrowRight moves activeId to nextElementSibling', () => {
    const a = document.getElementById('child-a')!;
    addElement(a, false);
    press('ArrowRight');
    const activeEl = getElement(getState().activeId ?? '');
    expect(activeEl?.id).toBe('child-b');
    dispose();
  });

  test('ArrowLeft moves activeId to previousElementSibling', () => {
    const c = document.getElementById('child-c')!;
    addElement(c, false);
    press('ArrowLeft');
    const activeEl = getElement(getState().activeId ?? '');
    expect(activeEl?.id).toBe('child-b');
    dispose();
  });

  test('ArrowDown is no-op when element has no children', () => {
    const leaf = document.getElementById('child-a')!;
    addElement(leaf, false);
    const beforeId = getState().activeId;
    press('ArrowDown');
    expect(getState().activeId).toBe(beforeId);
    dispose();
  });

  test('ArrowLeft is no-op when no previous sibling', () => {
    const first = document.getElementById('child-a')!;
    addElement(first, false);
    const beforeId = getState().activeId;
    press('ArrowLeft');
    expect(getState().activeId).toBe(beforeId);
    dispose();
  });

  test('ArrowUp stops at body and does not navigate further', () => {
    const root = document.getElementById('root')!;
    addElement(root, false);
    press('ArrowUp');
    // root.parentElement is body — should NOT switch to body.
    const activeEl = getElement(getState().activeId ?? '');
    expect(activeEl?.id).toBe('root');
    dispose();
  });
});
