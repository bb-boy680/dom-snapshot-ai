import type { StyleProp } from './style-groups';
import type { Snapshot, SnapshotMode } from './html-snapshot';

export interface SelectionItem {
  id: string;
  selector: string;
  label: string;
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
    return typeof location !== 'undefined' ? location.pathname : '/';
  } catch {
    return '/';
  }
}

function elementHeading(item: SelectionItem): string {
  const fromHtml = firstOpenTag(item.htmlSnap.html);
  if (fromHtml) return fromHtml;
  // Fallback: derive `<tag>` from the trailing segment of the selector.
  const last = item.selector.split('>').pop()?.trim() ?? '';
  const tag = last.split(/[.#[:\s]/, 1)[0] || 'element';
  return `<${tag}>`;
}

function firstOpenTag(html: string): string {
  const m = html.match(/<[a-zA-Z][^>]*>/);
  return m ? m[0] : '';
}
