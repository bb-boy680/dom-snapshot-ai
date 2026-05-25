export type SnapshotMode = 'simplified' | 'full';

export interface Snapshot {
  html: string;
  lineCount: number;
  charCount: number;
}

const TEXT_LIMIT = 100;
const INNER_HTML_LIMIT = 200;
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

export function htmlSnapshot(el: Element, mode: SnapshotMode = 'simplified'): Snapshot {
  const html = mode === 'simplified' ? buildSimplified(el) : buildFull(el);
  return {
    html,
    lineCount: html.split('\n').length,
    charCount: html.length,
  };
}

function buildSimplified(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const attrs = renderAttrs(el);
  if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
  const inner = el.innerHTML.trim();
  const truncated = inner.length > INNER_HTML_LIMIT ? inner.slice(0, INNER_HTML_LIMIT) + '…' : inner;
  // If innerHTML has newlines, put closing tag on new line
  if (truncated.includes('\n')) {
    return `<${tag}${attrs}>\n${truncated}\n</${tag}>`;
  }
  return `<${tag}${attrs}>${truncated}</${tag}>`;
}

function buildFull(el: Element): string {
  return serialize(el, 0);
}

function serialize(node: Node, depth: number): string {
  const indent = '  '.repeat(depth);

  if (node.nodeType === 3) {
    const t = collapseWs(node.textContent ?? '');
    return t ? indent + truncate(t) : '';
  }
  if (node.nodeType !== 1) return '';

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const attrs = renderAttrs(el);

  if (VOID_TAGS.has(tag)) return `${indent}<${tag}${attrs}>`;

  // Drop whitespace-only text nodes so they don't pollute the layout.
  const meaningful = Array.from(el.childNodes).filter((c) => {
    if (c.nodeType !== 3) return true;
    return collapseWs(c.textContent ?? '').length > 0;
  });

  if (meaningful.length === 0) {
    return `${indent}<${tag}${attrs}></${tag}>`;
  }

  // If all remaining children are text, render on one line.
  if (meaningful.every((c) => c.nodeType === 3)) {
    const text = meaningful.map((c) => collapseWs(c.textContent ?? '')).join(' ');
    return `${indent}<${tag}${attrs}>${truncate(text)}</${tag}>`;
  }

  const childOut = meaningful
    .map((c) => serialize(c, depth + 1))
    .filter(Boolean)
    .join('\n');
  return `${indent}<${tag}${attrs}>\n${childOut}\n${indent}</${tag}>`;
}

function renderAttrs(el: Element): string {
  return Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join('');
}

function collapseWs(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function truncate(s: string): string {
  return s.length > TEXT_LIMIT ? s.slice(0, TEXT_LIMIT) + '…' : s;
}
