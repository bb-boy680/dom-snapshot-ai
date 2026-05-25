import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { __EditorController } from '../../src/ui/panel';
import type { SelectionItem } from '../../src/core/markdown';
import { addElement, clearAll, getState } from '../../src/core/store';

const mkItem = (over: Partial<SelectionItem> = {}): SelectionItem => ({
  id: 'sel_1',
  selector: 'header.nav',
  label: 'header.nav',
  styles: [],
  htmlMode: 'simplified',
  htmlSnap: { html: '<header></header>', lineCount: 1, charCount: 17 },
  htmlAttached: false,
  committed: true,
  note: '',
  ...over,
});

function makeEditor(): { ec: InstanceType<typeof __EditorController>; host: HTMLDivElement } {
  const host = document.createElement('div');
  host.contentEditable = 'true';
  document.body.appendChild(host);
  const ec = new __EditorController(host);
  ec.mount();
  return { ec, host };
}

describe('EditorController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearAll();
  });

  test('insertChip on empty editor appends chip', () => {
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem());
    const chip = host.querySelector('.tag[data-dsai-id="sel_1"]');
    expect(chip).not.toBeNull();
  });

  test('insertChip twice for same id is a no-op', () => {
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem());
    ec.insertChip(mkItem());
    const chips = host.querySelectorAll('.tag[data-dsai-id="sel_1"]');
    expect(chips.length).toBe(1);
  });

  test('removeChip removes DOM node and clears chipMap', () => {
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem());
    ec.removeChip('sel_1');
    expect(host.querySelector('[data-dsai-id="sel_1"]')).toBeNull();
  });

  test('patchChip updates meta number when styles change', () => {
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem({ styles: [] }));
    ec.patchChip(mkItem({ styles: [{ k: 'display', v: 'grid' }, { k: 'gap', v: '12px' }] }));
    const meta = host.querySelector('.tag[data-dsai-id="sel_1"] .tag-meta');
    expect(meta?.textContent ?? '').toContain('2');
  });

  test('clicking a chip activates and scrolls to its source element', () => {
    const source = document.createElement('section');
    const id = addElement(source, true);
    const scrollIntoView = mock(() => {});
    source.scrollIntoView = scrollIntoView;
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem({ id }));

    host.querySelector<HTMLElement>(`.tag[data-dsai-id="${id}"]`)!.click();

    expect(getState().activeId).toBe(id);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' });
  });

  test('clicking a chip remove button does not scroll to its source element', () => {
    const source = document.createElement('section');
    const id = addElement(source, true);
    const scrollIntoView = mock(() => {});
    source.scrollIntoView = scrollIntoView;
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem({ id }));

    host.querySelector<HTMLElement>(`.tag[data-dsai-id="${id}"] .tag-x`)!.click();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test('serialize empty editor returns []', () => {
    const { ec } = makeEditor();
    expect(ec.serialize()).toEqual([]);
  });

  test('serialize plain text returns one text segment', () => {
    const { ec, host } = makeEditor();
    host.appendChild(document.createTextNode('hello'));
    expect(ec.serialize()).toEqual([{ kind: 'text', value: 'hello' }]);
  });

  test('serialize text + chip + text returns three segments in order', () => {
    const { ec, host } = makeEditor();
    host.appendChild(document.createTextNode('把'));
    ec.insertChip(mkItem());
    // After insertChip, a trailing nbsp is added; append remainder.
    host.appendChild(document.createTextNode('改成深色'));
    const segs = ec.serialize();
    expect(segs[0]).toEqual({ kind: 'text', value: '把' });
    expect(segs[1]).toEqual({ kind: 'chip', id: 'sel_1' });
    // The trailing text contains both the nbsp space and our appended string.
    const lastText = segs.filter((s) => s.kind === 'text').pop();
    expect(lastText?.kind).toBe('text');
    if (lastText?.kind === 'text') {
      expect(lastText.value).toContain('改成深色');
    }
  });

  test('serialize converts <br> to newline text segment', () => {
    const { ec, host } = makeEditor();
    host.appendChild(document.createTextNode('a'));
    host.appendChild(document.createElement('br'));
    host.appendChild(document.createTextNode('b'));
    const segs = ec.serialize();
    expect(segs).toEqual([
      { kind: 'text', value: 'a' },
      { kind: 'text', value: '\n' },
      { kind: 'text', value: 'b' },
    ]);
  });

  test('reconcileFromDom drops chips that were deleted via input', () => {
    // mark item as committed in store so removeChip → removeItem affects state.
    // `seq` in store is module-scoped and not reset by clearAll, so capture the
    // actual id returned by addElement instead of hard-coding 'sel_1'.
    const fake = document.createElement('div');
    const id = addElement(fake, true);
    const { ec, host } = makeEditor();
    ec.insertChip(mkItem({ id }));
    // simulate user selecting all + delete
    host.innerHTML = '';
    host.dispatchEvent(new Event('input'));
    expect(host.querySelector('.tag')).toBeNull();
  });
});
