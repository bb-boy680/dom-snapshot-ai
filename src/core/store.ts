import { selectorFor, shortLabelFor, titleFor } from './selector-path';
import { collectStyles, type StyleGroupData, type StyleProp } from './style-groups';
import { htmlSnapshot, type Snapshot, type SnapshotMode } from './html-snapshot';
import { componentPathFor } from './component-path';
import type { SelectionItem } from './markdown';

export interface AppState {
  items: SelectionItem[];
  panelCollapsed: boolean;
  panelOpen: boolean;
  activeId: string | null;
  enabled: boolean;
}

type Listener = (s: AppState) => void;

const state: AppState = {
  items: [],
  panelCollapsed: false,
  panelOpen: true,
  activeId: null,
  enabled: true,
};

const elementById = new Map<string, Element>();
const styleCache = new Map<string, StyleGroupData[]>();
const listeners = new Set<Listener>();

let seq = 0;

function notify(): void {
  listeners.forEach((l) => l(state));
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  l(state);
  return () => listeners.delete(l);
}

export function getState(): AppState {
  return state;
}

export function getElement(id: string): Element | undefined {
  return elementById.get(id);
}

export function getStyleGroups(id: string): StyleGroupData[] {
  const cached = styleCache.get(id);
  if (cached) return cached;
  const el = elementById.get(id);
  if (!el) return [];
  const groups = collectStyles(el);
  styleCache.set(id, groups);
  return groups;
}

export function addElement(el: Element, commit = false): string {
  for (const [id, existing] of elementById) {
    if (existing === el) {
      state.activeId = id;
      if (commit) {
        state.items = state.items.map((it) => (it.id === id ? { ...it, committed: true } : it));
      }
      notify();
      return id;
    }
  }
  // Drop any prior uncommitted preview so we never accumulate ghost items.
  state.items.filter((it) => !it.committed).forEach((it) => {
    elementById.delete(it.id);
    styleCache.delete(it.id);
  });
  state.items = state.items.filter((it) => it.committed);

  const id = `sel_${++seq}`;
  elementById.set(id, el);
  const snap = htmlSnapshot(el, 'simplified');
  const compPath = componentPathFor(el);
  state.items = [
    ...state.items,
    {
      id,
      selector: selectorFor(el),
      label: shortLabelFor(el),
      title: titleFor(el),
      styles: [],
      htmlMode: 'simplified',
      htmlSnap: snap,
      htmlAttached: true,
      committed: commit,
      note: '',
      componentPath: compPath,
    },
  ];
  state.activeId = id;
  notify();
  return id;
}

export function commitItem(id: string): void {
  state.items = state.items.map((it) => (it.id === id ? { ...it, committed: true } : it));
  notify();
}

export function uncommitItem(id: string): void {
  // Detaching from prompt — keep the preview alive on the page.
  state.items = state.items.map((it) => (it.id === id ? { ...it, committed: false } : it));
  notify();
}

export function removeItem(id: string): void {
  elementById.delete(id);
  styleCache.delete(id);
  state.items = state.items.filter((it) => it.id !== id);
  if (state.activeId === id) state.activeId = null;
  notify();
}

export function setActive(id: string | null): void {
  state.activeId = id;
  notify();
}

export function updateStyles(id: string, styles: StyleProp[]): void {
  state.items = state.items.map((it) => (it.id === id ? { ...it, styles } : it));
  notify();
}

export function updateHtmlMode(id: string, mode: SnapshotMode): void {
  const el = elementById.get(id);
  if (!el) return;
  const htmlSnap: Snapshot = htmlSnapshot(el, mode);
  state.items = state.items.map((it) =>
    it.id === id ? { ...it, htmlMode: mode, htmlSnap } : it,
  );
  notify();
}

export function setHtmlAttached(id: string, attached: boolean): void {
  state.items = state.items.map((it) => (it.id === id ? { ...it, htmlAttached: attached } : it));
  notify();
}

export function updateNote(id: string, note: string): void {
  state.items = state.items.map((it) => (it.id === id ? { ...it, note } : it));
  notify();
}

export function setPanelCollapsed(v: boolean): void {
  state.panelCollapsed = v;
  notify();
}

export function setPanelOpen(v: boolean): void {
  state.panelOpen = v;
  notify();
}

export function setEnabled(next: boolean): void {
  if (state.enabled === next) return;
  if (!next) {
    // Disabling ends the selection session — clear active selection so
    // re-enabling doesn't resurrect old outlines via syncSelectedFromState.
    state.activeId = null;
  }
  state.enabled = next;
  notify();
}

export function clearAll(): void {
  elementById.clear();
  styleCache.clear();
  state.items = [];
  state.activeId = null;
  notify();
}

export type BusEvent =
  | { type: 'chip-insert-request'; id: string }
  | { type: 'editor-clear' }
  | { type: 'copy-request' };
type BusListener = (e: BusEvent) => void;
const busListeners = new Set<BusListener>();

export function emit(e: BusEvent): void {
  busListeners.forEach((l) => l(e));
}

export function onBus(cb: BusListener): () => void {
  busListeners.add(cb);
  return () => busListeners.delete(cb);
}
