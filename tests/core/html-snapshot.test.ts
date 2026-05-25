import { describe, it, expect } from 'bun:test';
import { htmlSnapshot } from '../../src/core/html-snapshot';

describe('htmlSnapshot', () => {
  it('simplified returns self-only outerHTML', () => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = '<span>hi</span>';
    const snap = htmlSnapshot(div, 'simplified');
    expect(snap.html).toBe('<div class="card"></div>');
    expect(snap.lineCount).toBe(1);
    expect(snap.charCount).toBe(snap.html.length);
  });

  it('full includes children and truncates long text', () => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('x'.repeat(150)));
    const snap = htmlSnapshot(div, 'full');
    expect(snap.html.includes('…')).toBe(true);
  });
});
