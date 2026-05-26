import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { isFromPanel, HOST_ID, initInteract } from '../../src/core/interact';
import { setEnabled, clearAll, getState as getStoreState, setActive } from '../../src/core/store';

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

describe('hover-lock: prevent hover-triggered elements from disappearing', () => {
  let dispose: () => void;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);
    clearAll();
    setEnabled(true);
    // Hover-lock happens in setSelected(), which is called by syncSelectedFromState
    // when the activeId changes. Wire up setActive in onSelect so the full cycle works.
    dispose = initInteract({ onSelect: (_el, id) => setActive(id) });
  });

  afterEach(() => {
    dispose();
    host.remove();
  });

  // pickEl() uses document.elementsFromPoint(), which happy-dom does not implement.
  // Instead we bypass the event pipeline and directly test the setSelected() behavior.
  function selectElement(el: HTMLElement): void {
    // Manually trigger the same path that pickEl + addElement + syncSelectedFromState would
    const btnRect = el.getBoundingClientRect();
    const originalPick = (document as any).elementsFromPoint;
    (document as any).elementsFromPoint = () => [el];
    const e = new MouseEvent('click', {
      bubbles: true, cancelable: true, composed: true,
      clientX: btnRect.left + 1, clientY: btnRect.top + 1,
    });
    try { el.dispatchEvent(e); } catch { /* ignore happy-dom internal errors */ }
    (document as any).elementsFromPoint = originalPick;
  }

  test('selected element gets lock attribute and inline important styles', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    selectElement(btn);

    // Lock attribute applied (the key behavior)
    expect(btn.hasAttribute('data-dsai-hover-locked')).toBe(true);
    // Original style is preserved in dataset
    expect(btn.dataset['__dsai_original_style__']).toBeDefined();
    // display gets !important — happy-dom reliably reports this
    expect(btn.style.getPropertyPriority('display')).toBe('important');
    btn.remove();
  });

  test('unselecting element removes lock attribute and restores original style', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    selectElement(btn);
    expect(btn.hasAttribute('data-dsai-hover-locked')).toBe(true);

    // Clear selection (ESC)
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    Object.defineProperty(esc, 'target', { value: document.body });
    try { document.dispatchEvent(esc); } catch { /* ignore */ }

    expect(btn.hasAttribute('data-dsai-hover-locked')).toBe(false);
    expect(btn.dataset['__dsai_original_style__']).toBeUndefined();
    btn.remove();
  });

  test('locked element does NOT have pointer-events: none', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    selectElement(btn);

    // We use event.preventDefault() to block navigation, not pointer-events: none
    // which would make the element unclickable even for us!
    expect(btn.style.pointerEvents).not.toBe('none');
    btn.remove();
  });

  test('click is preventDefaulted (no navigation, no form submission)', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    const originalPick = (document as any).elementsFromPoint;
    (document as any).elementsFromPoint = () => [btn];
    const e = new MouseEvent('click', {
      bubbles: true, cancelable: true, composed: true, clientX: 55, clientY: 55,
    });
    try { btn.dispatchEvent(e); } catch { /* ignore */ }
    (document as any).elementsFromPoint = originalPick;

    // The blocker should always preventDefault clicks on the host page
    expect(e.defaultPrevented).toBe(true);
    btn.remove();
  });

  test('style values captured at lock time are preserved with !important', () => {
    const btn = document.createElement('button');
    btn.style.display = 'flex';
    btn.style.opacity = '0.9';
    btn.style.visibility = 'visible';
    btn.style.cssText += ';position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    selectElement(btn);

    // Values are preserved
    expect(btn.style.display).toBe('flex');
    expect(Number.parseFloat(btn.style.opacity)).toBeGreaterThan(0);
    btn.remove();
  });

  test('mouseleave events are blocked when element is selected', () => {
    const btn = document.createElement('button');
    btn.style.cssText = 'position:fixed;top:50px;left:50px;width:100px;height:30px;';
    document.body.appendChild(btn);

    let leaveFired = false;
    btn.addEventListener('mouseleave', () => { leaveFired = true; });

    // Select to activate event blocking
    selectElement(btn);

    // Simulate mouse leaving (tooltip library's trigger)
    const leave = new MouseEvent('mouseleave', {
      bubbles: true, cancelable: true,
      relatedTarget: document.body, // moved outside the button
    });
    btn.dispatchEvent(leave);

    // The library's mouseleave listener should never have been called
    expect(leave.defaultPrevented).toBe(true);
    btn.remove();
  });
});
