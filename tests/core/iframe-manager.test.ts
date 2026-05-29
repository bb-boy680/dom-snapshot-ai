import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { createIframeManager, type IframeManager } from '../../src/core/iframe-manager';

describe('IframeManager', () => {
  let manager: IframeManager;

  beforeEach(() => {
    manager = createIframeManager();
  });

  afterEach(() => {
    manager.dispose();
  });

  test('bind 同源 iframe 注入样式到 contentDocument.head', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});

    const style = doc.getElementById('__dom_snapshot_ai_outline_style__');
    expect(style).toBeTruthy();
    expect(doc.documentElement.classList.contains('__dsai_active__')).toBe(true);
    iframe.remove();
  });

  test('unbind 移除注入的样式和 __dsai_active__ 类', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});
    manager.unbind(iframe);

    expect(doc.getElementById('__dom_snapshot_ai_outline_style__')).toBeFalsy();
    expect(doc.documentElement.classList.contains('__dsai_active__')).toBe(false);
    iframe.remove();
  });

  test('bindAll 绑定文档中所有同源 iframe', () => {
    const iframe1 = document.createElement('iframe');
    const iframe2 = document.createElement('iframe');
    document.body.appendChild(iframe1);
    document.body.appendChild(iframe2);

    manager.bindAll(() => {}, () => {});

    const doc1 = iframe1.contentDocument;
    const doc2 = iframe2.contentDocument;
    if (doc1) expect(doc1.getElementById('__dom_snapshot_ai_outline_style__')).toBeTruthy();
    if (doc2) expect(doc2.getElementById('__dom_snapshot_ai_outline_style__')).toBeTruthy();
    iframe1.remove();
    iframe2.remove();
  });

  test('unbindAll 清理所有绑定的 iframe', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});
    manager.unbindAll();

    expect(doc.getElementById('__dom_snapshot_ai_outline_style__')).toBeFalsy();
    iframe.remove();
  });

  test('dispose 等价于 unbindAll', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});
    manager.dispose();

    expect(doc.getElementById('__dom_snapshot_ai_outline_style__')).toBeFalsy();
    expect(() => manager.dispose()).not.toThrow();
    iframe.remove();
  });

  test('getIframeFor 返回包含指定元素的 iframe', () => {
    const iframe = document.createElement('iframe');
    iframe.id = 'test-iframe';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});

    const innerDiv = doc.createElement('div');
    doc.body.appendChild(innerDiv);

    expect(manager.getIframeFor(innerDiv)).toBe(iframe);
    iframe.remove();
  });

  test('getIframeFor 对顶层元素返回 null', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(manager.getIframeFor(div)).toBeNull();
    div.remove();
  });

  test('bind 跨域 iframe (contentDocument 不可访问) 不抛错', () => {
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentDocument', { get: () => { throw new DOMException('Blocked', 'SecurityError'); } });
    document.body.appendChild(iframe);

    expect(() => manager.bind(iframe, () => {}, () => {})).not.toThrow();
    iframe.remove();
  });

  test('bind 对 contentDocument 为 null 的 iframe 不注入样式', () => {
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentDocument', { get: () => null });
    document.body.appendChild(iframe);

    manager.bind(iframe, () => {}, () => {});
    expect(manager.boundCount()).toBe(0);
    iframe.remove();
  });

  test('refreshStyles 更新所有已绑定 iframe 的 outline 样式', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { iframe.remove(); return; }

    manager.bind(iframe, () => {}, () => {});
    manager.refreshStyles('/* updated */');

    const style = doc.getElementById('__dom_snapshot_ai_outline_style__');
    expect(style?.textContent).toContain('updated');
    iframe.remove();
  });
});
