import { describe, it, expect } from 'bun:test';
import { buildMarkdown, type Segment, type SelectionItem } from '../../src/core/markdown';

const mkItem = (over: Partial<SelectionItem> = {}): SelectionItem => ({
  id: 'sel_1',
  selector: 'section.pricing',
  label: 'section.pricing',
  styles: [],
  htmlMode: 'simplified',
  htmlSnap: { html: '<section class="pricing"></section>', lineCount: 1, charCount: 36 },
  htmlAttached: false,
  committed: true,
  note: '',
  ...over,
});

describe('buildMarkdown', () => {
  it('returns empty string for empty segments', () => {
    expect(buildMarkdown([], [])).toBe('');
  });

  it('passes plain text segments through unchanged', () => {
    const segs: Segment[] = [{ kind: 'text', value: 'hello world' }];
    expect(buildMarkdown(segs, [])).toBe('hello world');
  });

  it('expands a chip segment into an Element block at its position', () => {
    const item = mkItem({ note: '改成三列', htmlAttached: true });
    const segs: Segment[] = [
      { kind: 'text', value: '把' },
      { kind: 'chip', id: 'sel_1' },
      { kind: 'text', value: '改成三列。' },
    ];
    const out = buildMarkdown(segs, [item]);
    expect(out).toContain('把');
    expect(out).toContain('# Element: section.pricing');
    expect(out).toContain('- **selector**: section.pricing');
    expect(out).toContain('改成三列。');
    // chip block should appear between the two text segments.
    const beforeIdx = out.indexOf('把');
    const elemIdx = out.indexOf('# Element');
    const afterIdx = out.indexOf('改成三列。');
    expect(beforeIdx).toBeLessThan(elemIdx);
    expect(elemIdx).toBeLessThan(afterIdx);
  });

  it('skips chip whose id is not in items', () => {
    const segs: Segment[] = [
      { kind: 'text', value: 'a' },
      { kind: 'chip', id: 'missing' },
      { kind: 'text', value: 'b' },
    ];
    expect(buildMarkdown(segs, [])).toBe('ab');
  });

  it('omits Modification Request block when note is empty', () => {
    const item = mkItem({ note: '' });
    const out = buildMarkdown([{ kind: 'chip', id: 'sel_1' }], [item]);
    expect(out).not.toContain('Modification Request');
  });

  it('omits HTML block when htmlAttached is false', () => {
    const item = mkItem({ htmlAttached: false });
    const out = buildMarkdown([{ kind: 'chip', id: 'sel_1' }], [item]);
    expect(out).not.toContain('**HTML');
  });

  it('does not add leading or trailing blank lines around element blocks', () => {
    const item = mkItem({ htmlAttached: true });
    const out = buildMarkdown([{ kind: 'chip', id: 'sel_1' }], [item]);
    expect(out.startsWith('\n')).toBe(false);
    expect(out.endsWith('\n')).toBe(false);
  });

  it('puts text after an element block on a new line', () => {
    const item = mkItem({ htmlAttached: true });
    const out = buildMarkdown(
      [
        { kind: 'chip', id: 'sel_1' },
        { kind: 'text', value: '123123' },
      ],
      [item],
    );
    expect(out).toContain('```\n123123');
  });

  it('renders Computed Styles when styles are present', () => {
    const item = mkItem({
      styles: [
        { k: 'display', v: 'grid' },
        { k: 'gap', v: '12px' },
      ],
    });
    const out = buildMarkdown([{ kind: 'chip', id: 'sel_1' }], [item]);
    expect(out).toContain('**Computed Styles**');
    expect(out).toContain('display: grid;');
    expect(out).toContain('gap: 12px;');
  });

  it('full PRD-shaped snapshot for one chip surrounded by text', () => {
    const item = mkItem({
      selector: 'div.product-card',
      label: 'div.product-card',
      note: '整体改成深色：背景 #0a0a0a，主文本 #f5f5f7。',
      styles: [
        { k: 'display', v: 'inline-flex' },
        { k: 'padding', v: '8px 16px' },
      ],
      htmlMode: 'full',
      htmlSnap: {
        html: '<div class="product-card"><h3>AirPods Pro</h3></div>',
        lineCount: 1,
        charCount: 48,
      },
      htmlAttached: true,
    });
    const segs: Segment[] = [
      { kind: 'text', value: '把' },
      { kind: 'chip', id: 'sel_1' },
      { kind: 'text', value: '整体改成深色：背景 #0a0a0a，主文本 #f5f5f7。' },
    ];
    const out = buildMarkdown(segs, [item]);
    expect(out).toContain('# Element: div.product-card');
    expect(out).toContain('- **selector**: div.product-card');
    expect(out).toContain('- **Modification Request**:');
    expect(out).toContain('```text');
    expect(out).toContain('整体改成深色：背景 #0a0a0a，主文本 #f5f5f7。');
    expect(out).toContain('- **Computed Styles**:');
    expect(out).toContain('```css');
    expect(out).toContain('display: inline-flex;');
    expect(out).toContain('- **HTML (full)**:');
    expect(out).toContain('```html');
    expect(out).toContain('<div class="product-card">');
  });
});
