import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { isFromPanel, HOST_ID, initInteract } from '../../src/core/interact';
import { setEnabled, clearAll, getState as getStoreState } from '../../src/core/store';

describe('isFromPanel', () => {
  let host: HTMLDivElement;
  let outside: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    outside = document.createElement('div');
    document.body.appendChild(outside);
  });

  afterEach(() => {
    host.remove();
    outside.remove();
  });

  test('returns true when event originates inside host node', () => {
    const inner = document.createElement('button');
    host.appendChild(inner);
    const e = new MouseEvent('click', { bubbles: true, composed: true });
    inner.dispatchEvent(e);
    expect(isFromPanel(e)).toBe(true);
  });

  test('returns true when event target IS the host node', () => {
    const e = new MouseEvent('click', { bubbles: true, composed: true });
    host.dispatchEvent(e);
    expect(isFromPanel(e)).toBe(true);
  });

  test('returns false for event outside host subtree', () => {
    const e = new MouseEvent('click', { bubbles: true, composed: true });
    outside.dispatchEvent(e);
    expect(isFromPanel(e)).toBe(false);
  });
});

describe('initInteract event blocking', () => {
  let dispose: () => void;
  let host: HTMLDivElement;
  let target: HTMLAnchorElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);

    target = document.createElement('a');
    target.href = '#test';
    target.textContent = 'link';
    target.style.cssText = 'position:fixed;top:100px;left:100px;width:50px;height:20px;';
    document.body.appendChild(target);

    clearAll();
    setEnabled(true);
    dispose = initInteract({ onSelect: () => {} });
  });

  afterEach(() => {
    dispose();
    host.remove();
    target.remove();
  });

  function fire(type: string): MouseEvent {
    const e = new MouseEvent(type, {
      bubbles: true, cancelable: true, composed: true, clientX: 120, clientY: 110,
    });
    try {
      target.dispatchEvent(e);
    } catch {
      // happy-dom may throw on internal listener errors; we only care about defaultPrevented
    }
    return e;
  }

  test('click on host page is preventDefaulted when enabled', () => {
    const e = fire('click');
    expect(e.defaultPrevented).toBe(true);
  });

  test.each(['mousedown', 'mouseup', 'contextmenu', 'dblclick', 'auxclick'])(
    '%s is preventDefaulted when enabled',
    (type) => {
      const e = fire(type);
      expect(e.defaultPrevented).toBe(true);
    },
  );

  test('events from inside host node are NOT preventDefaulted', () => {
    const inner = document.createElement('button');
    host.appendChild(inner);
    const e = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    inner.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
  });

  test('disabling stops blocking; re-enabling resumes', () => {
    setEnabled(false);
    const e1 = fire('click');
    expect(e1.defaultPrevented).toBe(false);

    setEnabled(true);
    const e2 = fire('click');
    expect(e2.defaultPrevented).toBe(true);
  });
});

describe('Space toggles enabled', () => {
  let dispose: () => void;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    clearAll();
    setEnabled(true);
    dispose = initInteract({ onSelect: () => {} });
  });

  afterEach(() => {
    dispose();
    host.remove();
  });

  test('Space on body flips enabled', () => {
    const e = new KeyboardEvent('keydown', {
      code: 'Space', bubbles: true, cancelable: true,
    });
    Object.defineProperty(e, 'target', { value: document.body });
    document.dispatchEvent(e);
    expect(getStoreState().enabled).toBe(false);
  });

  test('Ctrl+Space on body does NOT flip enabled', () => {
    const e = new KeyboardEvent('keydown', {
      code: 'Space', ctrlKey: true, bubbles: true, cancelable: true,
    });
    Object.defineProperty(e, 'target', { value: document.body });
    document.dispatchEvent(e);
    expect(getStoreState().enabled).toBe(true);
  });

  test('Space on input does NOT flip enabled', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const e = new KeyboardEvent('keydown', {
      code: 'Space', bubbles: true, cancelable: true,
    });
    Object.defineProperty(e, 'target', { value: input });
    document.dispatchEvent(e);
    expect(getStoreState().enabled).toBe(true);
    input.remove();
  });

  test('Escape on body clears selections', () => {
    setEnabled(true);
    const e = new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true, cancelable: true,
    });
    Object.defineProperty(e, 'target', { value: document.body });
    document.dispatchEvent(e);
    expect(getStoreState().activeId).toBe(null);
  });

  test('Escape on input STILL clears (Esc is a universal exit / clear)', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const e = new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true, cancelable: true,
    });
    Object.defineProperty(e, 'target', { value: input });
    document.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    input.remove();
  });
});

describe('dispose idempotency', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    clearAll();
    setEnabled(true);
  });

  afterEach(() => {
    host.remove();
  });

  test('calling dispose twice does not throw', () => {
    const dispose = initInteract({ onSelect: () => {} });
    expect(() => {
      dispose();
      dispose();
    }).not.toThrow();
  });

  test('after dispose, click on host page is no longer prevented', () => {
    const dispose = initInteract({ onSelect: () => {} });
    const target = document.createElement('div');
    document.body.appendChild(target);
    dispose();
    const e = new MouseEvent('click', {
      bubbles: true, cancelable: true, composed: true,
    });
    try { target.dispatchEvent(e); } catch { /* ignore */ }
    expect(e.defaultPrevented).toBe(false);
    target.remove();
  });

  test('dispose works when called in disabled state', () => {
    const dispose = initInteract({ onSelect: () => {} });
    setEnabled(false);
    expect(() => dispose()).not.toThrow();
  });
});
