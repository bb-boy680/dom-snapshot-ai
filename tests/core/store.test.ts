import { describe, expect, test, beforeEach } from 'bun:test';
import { getState, setEnabled, subscribe, clearAll, emit, onBus } from '../../src/core/store';

describe('store.enabled', () => {
  beforeEach(() => {
    clearAll();
    setEnabled(true);
  });

  test('defaults to true', () => {
    expect(getState().enabled).toBe(true);
  });

  test('setEnabled(false) flips the flag', () => {
    setEnabled(false);
    expect(getState().enabled).toBe(false);
  });

  test('setEnabled notifies subscribers', () => {
    let calls = 0;
    const unsub = subscribe(() => { calls++; });
    calls = 0;
    setEnabled(false);
    expect(calls).toBe(1);
    setEnabled(true);
    expect(calls).toBe(2);
    unsub();
  });
});

describe('store.bus', () => {
  test('emit notifies onBus subscribers', () => {
    const received: Array<{ type: string; id: string }> = [];
    const unsub = onBus((e) => {
      if (e.type === 'chip-insert-request') received.push({ type: e.type, id: e.id });
    });
    emit({ type: 'chip-insert-request', id: 'sel_1' });
    expect(received).toEqual([{ type: 'chip-insert-request', id: 'sel_1' }]);
    unsub();
  });

  test('unsubscribed callback no longer fires', () => {
    let calls = 0;
    const unsub = onBus(() => { calls++; });
    unsub();
    emit({ type: 'chip-insert-request', id: 'sel_1' });
    expect(calls).toBe(0);
  });
});
