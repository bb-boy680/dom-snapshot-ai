import type { StyleProp } from './style-groups';
import type { Snapshot, SnapshotMode } from './html-snapshot';

export interface SelectionItem {
  id: string;
  selector: string;
  label: string;
  title: string;
  styles: StyleProp[];
  htmlMode: SnapshotMode;
  htmlSnap: Snapshot;
  htmlAttached: boolean;
  committed: boolean;
  note: string;
}

export type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'chip'; id: string };

export function buildMarkdown(segments: Segment[], items: SelectionItem[]): string {
  const byId = new Map(items.map((it) => [it.id, it]));
  let out = '';
  let previousWasBlock = false;
  for (const seg of segments) {
    if (seg.kind === 'text') {
      out += previousWasBlock && seg.value && !seg.value.startsWith('\n') ? `\n${seg.value}` : seg.value;
      previousWasBlock = false;
      continue;
    }
    const item = byId.get(seg.id);
    if (!item) continue;
    const block = renderElementBlock(item);
    out += out.endsWith('\n') || out === '' ? block : `\n${block}`;
    previousWasBlock = true;
  }
  return out;
}

function renderElementBlock(item: SelectionItem): string {
  const lines: string[] = [];
  lines.push(`# Element: ${elementHeading(item)}`);
  lines.push(`- **URL**: ${currentUrlPath()}`);
  lines.push('');
  lines.push(`- **selector**: ${item.selector}`);
  lines.push('');
  if (item.note.trim()) {
    lines.push('- **Modification Request**:');
    lines.push('```text');
    lines.push(item.note.trim());
    lines.push('```');
    lines.push('');
  }
  if (item.styles.length) {
    lines.push('- **Computed Styles**:');
    lines.push('```css');
    item.styles.forEach((p) => lines.push(`${p.k}: ${p.v};`));
    lines.push('```');
    lines.push('');
  }
  if (item.htmlAttached) {
    lines.push(`- **HTML (${item.htmlMode})**:`);
    lines.push('```html');
    lines.push(item.htmlSnap.html);
    lines.push('```');
  }
  return lines.join('\n');
}

function currentUrlPath(): string {
  try {
    if (typeof location === 'undefined') return '/';
    return `${location.pathname}${location.search}${location.hash}` || '/';
  } catch {
    return '/';
  }
}

function elementHeading(item: SelectionItem): string {
  const tag = parseTagName(item.htmlSnap.html) ?? tagFromSelector(item.selector);
  const attrs = parseIdentifyingAttrs(item.htmlSnap.html);
  const rendered = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
  return rendered;
}

function parseTagName(html: string): string | null {
  const m = html.match(/<([a-zA-Z][a-zA-Z0-9-]*)/);
  return m ? m[1].toLowerCase() : null;
}

function tagFromSelector(selector: string): string {
  const last = selector.split('>').pop()?.trim() ?? '';
  return last.split(/[.#[:\s]/, 1)[0] || 'element';
}

function parseIdentifyingAttrs(html: string): string {
  const open = html.match(/<[a-zA-Z][^>]*>/);
  if (!open) return '';
  const tag = open[0];
  const id = tag.match(/\sid\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const cls = tag.match(/\sclass\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const parts: string[] = [];
  const idVal = id ? (id[2] ?? id[3] ?? id[4] ?? '') : '';
  if (idVal) parts.push(`id="${idVal}"`);
  const clsVal = cls ? (cls[2] ?? cls[3] ?? cls[4] ?? '') : '';
  if (clsVal) parts.push(`class="${clsVal.trim()}"`);
  return parts.join(' ');
}
