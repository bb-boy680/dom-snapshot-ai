export function selectorFor(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
    parts.unshift(segmentFor(cur));
    if (cur.id) break;
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

// Short label for toolbar — only the leaf node, e.g. `div.product-card` or `button#submit`.
export function shortLabelFor(el: Element): string {
  return segmentFor(el);
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
