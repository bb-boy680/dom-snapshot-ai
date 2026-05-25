import { describe, it, expect } from 'bun:test';
import { selectorFor } from '../../src/core/selector-path';

describe('selectorFor', () => {
  it('uses id when present', () => {
    document.body.innerHTML = '<div id="hero"></div>';
    const el = document.getElementById('hero')!;
    expect(selectorFor(el)).toContain('#hero');
  });

  it('uses class when available', () => {
    document.body.innerHTML = '<section class="card primary"></section>';
    const el = document.querySelector('section')!;
    expect(selectorFor(el)).toContain('.card');
  });

  it('uses nth-of-type for sibling disambiguation', () => {
    document.body.innerHTML = '<ul><li></li><li></li><li></li></ul>';
    const last = document.querySelectorAll('li')[2];
    expect(selectorFor(last)).toContain(':nth-of-type(3)');
  });
});
