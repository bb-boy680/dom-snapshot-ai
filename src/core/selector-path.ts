export function selectorFor(el: Element): string {
  const localSelector = selectorWithin(el);
  const ownerDoc = el.ownerDocument;
  if (ownerDoc && ownerDoc !== document) {
    const iframe = findIframeFor(el);
    if (iframe) {
      const iframePath = selectorWithin(iframe);
      const src = iframe.src || iframe.getAttribute('src') || '';
      const iframeSeg = src ? `${iframePath}[${src}]` : iframePath;
      return `${iframeSeg} > ${localSelector}`;
    }
  }
  return localSelector;
}

function selectorWithin(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  const ownerDoc = el.ownerDocument;
  while (cur && cur.nodeType === 1 && cur !== ownerDoc?.documentElement) {
    parts.unshift(segmentFor(cur));
    if (cur.id) break;
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

function findIframeFor(el: Element): HTMLIFrameElement | null {
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      if (iframe.contentDocument === el.ownerDocument) return iframe;
    } catch { /* 跨域 */ }
  }
  return null;
}

// Short label for toolbar — only the leaf node, e.g. `div.product-card` or `button#submit`.
export function shortLabelFor(el: Element): string {
  const base = segmentFor(el);
  if (el.ownerDocument !== document) {
    const iframeLabel = getIframeLabel(el);
    if (iframeLabel) return `${iframeLabel} > ${base}`;
  }
  return base;
}

function getIframeLabel(el: Element): string | null {
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      if (iframe.contentDocument === el.ownerDocument) {
        if (iframe.id) return `iframe#${iframe.id}`;
        if (iframe.name) return `iframe[name=${iframe.name}]`;
        return 'iframe';
      }
    } catch { /* 跨域 */ }
  }
  return null;
}

// Compact title for chip hover, e.g. `div.SignFlow-tab.SignFlow-tab--active` or `button#submit`.
export function titleFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${cssEscape(el.id)}`;
  const classes = Array.from(el.classList).map(cssEscape);
  if (classes.length) return `${tag}.${classes.join('.')}`;
  return tag;
}

function segmentFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${cssEscape(el.id)}`;

  const classes = Array.from(el.classList)
    .filter((c) => !/^[0-9]/.test(c) && c.length < 32)
    .slice(0, 2)
    .map(cssEscape);
  if (classes.length) return `${tag}.${classes.join('.')}`;

  const parent = el.parentElement;
  if (!parent) return tag;
  const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (sameTag.length === 1) return tag;
  const idx = sameTag.indexOf(el) + 1;
  return `${tag}:nth-of-type(${idx})`;
}

function cssEscape(s: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return s.replace(/([^\w-])/g, '\\$1');
}
