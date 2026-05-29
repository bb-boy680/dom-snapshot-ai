const STYLE_ID = '__dom_snapshot_ai_outline_style__';
const OUTLINE_CSS = `
html.__dsai_active__, html.__dsai_active__ * { cursor: crosshair !important; }
[data-dsai-hover] {
  outline: 1.5px dashed #0066cc !important;
  outline-offset: 2px !important;
}
[data-dsai-selected] {
  outline: 2px solid #0066cc !important;
  outline-offset: 3px !important;
}
`;

export interface IframeManager {
  bind(
    iframe: HTMLIFrameElement,
    onIframeClick: (el: Element, shiftKey: boolean) => void,
    onIframeMove: (el: Element | null) => void,
    onIframeKey?: (e: KeyboardEvent) => void,
  ): void;
  unbind(iframe: HTMLIFrameElement): void;
  bindAll(
    onIframeClick: (el: Element, shiftKey: boolean) => void,
    onIframeMove: (el: Element | null) => void,
    onIframeKey?: (e: KeyboardEvent) => void,
  ): void;
  unbindAll(): void;
  dispose(): void;
  getIframeFor(el: Element): HTMLIFrameElement | null;
  refreshStyles(cssText: string): void;
  boundCount(): number;
}

interface BoundEntry {
  cleanup: () => void;
  loadHandler: () => void;
}

export function createIframeManager(): IframeManager {
  const bound = new Map<HTMLIFrameElement, BoundEntry>();
  // 跟踪已经注册了 load 监听器但尚未成功 bind 的 iframe
  const pendingLoad = new Set<HTMLIFrameElement>();

  const getDoc = (iframe: HTMLIFrameElement): Document | null => {
    try {
      return iframe.contentDocument;
    } catch {
      return null;
    }
  };

  // 判断 iframe 是否已加载真实内容（非 about:blank）
  const isLoaded = (iframe: HTMLIFrameElement): boolean => {
    const doc = getDoc(iframe);
    if (!doc) return false;
    // about:blank 文档的 URL 是 "about:blank"，且没有 body 子元素
    try {
      if (doc.URL === 'about:blank' && !doc.body?.hasChildNodes()) return false;
    } catch { /* 跨域访问 doc.URL 可能抛异常 */ }
    return true;
  };

  const injectOutlineStyle = (doc: Document): void => {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = OUTLINE_CSS;
    doc.head?.appendChild(style);
  };

  const bind = (
    iframe: HTMLIFrameElement,
    onIframeClick: (el: Element, shiftKey: boolean) => void,
    onIframeMove: (el: Element | null) => void,
    onIframeKey?: (e: KeyboardEvent) => void,
  ): void => {
    if (bound.has(iframe)) return;
    const doc = getDoc(iframe);
    if (!doc) return;

    injectOutlineStyle(doc);
    doc.documentElement.classList.add('__dsai_active__');

    // 使用实时的 getDoc 查找而非闭包捕获，避免 iframe 导航后 doc 失效
    const onPointerdown = (e: PointerEvent): void => {
      e.stopImmediatePropagation();
    };

    const onClick = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const currentDoc = getDoc(iframe);
      if (!currentDoc) return;
      const el = currentDoc.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== currentDoc.documentElement && el !== currentDoc.body) {
        onIframeClick(el, e.shiftKey);
      }
    };

    const onMousemove = (e: MouseEvent): void => {
      const currentDoc = getDoc(iframe);
      if (!currentDoc) return;
      const el = currentDoc.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== currentDoc.documentElement && el !== currentDoc.body) {
        onIframeMove(el);
      } else {
        onIframeMove(null);
      }
    };

    const onPointermove = (e: PointerEvent): void => {
      const currentDoc = getDoc(iframe);
      if (!currentDoc) return;
      const el = currentDoc.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== currentDoc.documentElement && el !== currentDoc.body) {
        onIframeMove(el);
      } else {
        onIframeMove(null);
      }
    };

    doc.addEventListener('pointerdown', onPointerdown, true);
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('mousemove', onMousemove, true);
    doc.addEventListener('pointermove', onPointermove, true);
    if (onIframeKey) doc.addEventListener('keydown', onIframeKey, true);

    // 监听 iframe 导航（load 事件在 iframe 元素上触发，不在 contentDocument 上）
    // 导航后需要重新绑定，因为 contentDocument 已更换
    const loadHandler = (): void => {
      unbind(iframe);
      bind(iframe, onIframeClick, onIframeMove, onIframeKey);
    };
    iframe.addEventListener('load', loadHandler);

    pendingLoad.delete(iframe);

    bound.set(iframe, {
      cleanup: () => {
        try {
          const currentDoc = getDoc(iframe);
          if (currentDoc) {
            currentDoc.removeEventListener('pointerdown', onPointerdown, true);
            currentDoc.removeEventListener('click', onClick, true);
            currentDoc.removeEventListener('mousemove', onMousemove, true);
            currentDoc.removeEventListener('pointermove', onPointermove, true);
            if (onIframeKey) currentDoc.removeEventListener('keydown', onIframeKey, true);
            currentDoc.getElementById(STYLE_ID)?.remove();
            currentDoc.documentElement.classList.remove('__dsai_active__');
          }
        } catch { /* iframe 可能已销毁 */ }
        iframe.removeEventListener('load', loadHandler);
      },
      loadHandler,
    });
  };

  const unbind = (iframe: HTMLIFrameElement): void => {
    const entry = bound.get(iframe);
    if (entry) {
      entry.cleanup();
      bound.delete(iframe);
    }
    pendingLoad.delete(iframe);
  };

  const bindAll = (
    onIframeClick: (el: Element, shiftKey: boolean) => void,
    onIframeMove: (el: Element | null) => void,
    onIframeKey?: (e: KeyboardEvent) => void,
  ): void => {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      if (iframe instanceof HTMLIFrameElement) {
        // 立即尝试绑定（对已加载的 iframe 生效）
        bind(iframe, onIframeClick, onIframeMove, onIframeKey);
        // 如果绑定失败（iframe 尚未加载），注册 load 监听器延迟绑定
        if (!bound.has(iframe) && !pendingLoad.has(iframe)) {
          pendingLoad.add(iframe);
          const pendingLoadHandler = (): void => {
            pendingLoad.delete(iframe);
            bind(iframe, onIframeClick, onIframeMove, onIframeKey);
          };
          iframe.addEventListener('load', pendingLoadHandler, { once: true });
        }
      }
    }
  };

  const unbindAll = (): void => {
    for (const [, entry] of bound) {
      entry.cleanup();
    }
    bound.clear();
    pendingLoad.clear();
  };

  const dispose = (): void => {
    unbindAll();
  };

  const getIframeFor = (el: Element): HTMLIFrameElement | null => {
    for (const [iframe] of bound) {
      const doc = getDoc(iframe);
      if (doc && doc === el.ownerDocument) return iframe;
    }
    return null;
  };

  const refreshStyles = (cssText: string): void => {
    for (const [iframe] of bound) {
      try {
        const doc = getDoc(iframe);
        if (!doc) continue;
        const style = doc.getElementById(STYLE_ID);
        if (style) style.textContent = cssText;
      } catch { /* 跨域或已销毁 */ }
    }
  };

  const boundCountFn = (): number => bound.size;

  return { bind, unbind, bindAll, unbindAll, dispose, getIframeFor, refreshStyles, boundCount: boundCountFn };
}

/** 计算元素所属 iframe 在顶层文档中的偏移量。顶层元素返回 {x:0, y:0}。 */
export function getIframeOffset(el: Element): { x: number; y: number } {
  if (el.ownerDocument === document) return { x: 0, y: 0 };
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      if (iframe.contentDocument === el.ownerDocument) {
        const rect = iframe.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
      }
    } catch { /* 跨域 */ }
  }
  return { x: 0, y: 0 };
}
