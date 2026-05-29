import { describe, it, expect } from 'bun:test';
import { selectorFor, shortLabelFor } from '../../src/core/selector-path';

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

  it('对 iframe 内元素插入带宿主 DOM 路径和 src 的 iframe 段', () => {
    document.body.innerHTML = '<div id="app"><div class="layout"></div></div>';
    const layout = document.querySelector('div.layout')!;
    const iframe = document.createElement('iframe');
    layout.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }
    Object.defineProperty(iframe, 'src', { get: () => 'http://example.test/page.html', configurable: true });

    const div = doc.createElement('div');
    div.className = 'card';
    doc.body.appendChild(div);

    const sel = selectorFor(div);
    // 完整链：宿主 DOM 路径 > iframe[src] > iframe 内 DOM 路径
    expect(sel).toContain('#app');
    expect(sel).toContain('.layout');
    expect(sel).toContain('iframe[http://example.test/page.html]');
    expect(sel).toContain('div.card');
    // 顺序校验：iframe 段在 div.card 之前
    expect(sel.indexOf('iframe[')).toBeLessThan(sel.indexOf('div.card'));
    iframe.remove();
  });

  it('对无 src 的 iframe 退化为只用 DOM 路径', () => {
    document.body.innerHTML = '<main></main>';
    const main = document.querySelector('main')!;
    const iframe = document.createElement('iframe');
    main.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    const div = doc.createElement('div');
    div.className = 'inner';
    doc.body.appendChild(div);

    const sel = selectorFor(div);
    expect(sel).toContain('main');
    expect(sel).toMatch(/> iframe > /);
    expect(sel).not.toContain('iframe[');
    iframe.remove();
  });
});

describe('shortLabelFor', () => {
  it('对 iframe 内元素添加 iframe 前缀', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'myframe';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    const div = doc.createElement('div');
    div.className = 'card';
    doc.body.appendChild(div);

    const label = shortLabelFor(div);
    expect(label).toContain('iframe#myframe');
    expect(label).toContain('div.card');
    iframe.remove();
  });

  it('对顶层元素不添加 iframe 前缀', () => {
    document.body.innerHTML = '<div class="top-level"></div>';
    const el = document.querySelector('div.top-level')!;
    const label = shortLabelFor(el);
    expect(label).not.toContain('iframe');
    expect(label).toContain('div.top-level');
  });
});
