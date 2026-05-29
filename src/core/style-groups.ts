export type StyleGroupId = 'layout' | 'text' | 'bg' | 'border' | 'effects' | 'other';

export interface StyleProp {
  k: string;
  v: string;
  swatch?: string;
}

export interface StyleGroupData {
  id: StyleGroupId;
  title: string;
  props: StyleProp[];
}

const GROUP_PROPS: Record<StyleGroupId, string[]> = {
  layout: [
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'margin', 'padding', 'flex-direction', 'flex-wrap', 'flex', 'gap',
    'justify-content', 'align-items', 'align-self', 'grid-template-columns',
    'grid-template-rows', 'grid-column', 'grid-row', 'box-sizing',
  ],
  text: [
    'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
    'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
    'color', 'white-space', 'word-break',
  ],
  bg: [
    'background-color', 'background-image', 'background-size',
    'background-position', 'background-repeat', 'background-attachment',
  ],
  border: [
    'border', 'border-width', 'border-style', 'border-color',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-radius', 'outline', 'outline-offset',
  ],
  effects: [
    'opacity', 'transform', 'transition', 'animation',
    'box-shadow', 'filter', 'backdrop-filter', 'mix-blend-mode',
  ],
  other: [
    'cursor', 'z-index', 'overflow', 'overflow-x', 'overflow-y',
    'pointer-events', 'visibility', 'user-select',
  ],
};

const DEFAULTS = new Set([
  'none', 'auto', 'normal', 'visible', '0px', '0', '0% 0%',
  'rgba(0, 0, 0, 0)', 'transparent', 'repeat', 'scroll', 'static',
  'currentcolor', 'baseline', 'stretch', 'flex-start',
]);

export function collectStyles(el: Element): StyleGroupData[] {
  const view = el.ownerDocument.defaultView;
  const cs = view ? view.getComputedStyle(el) : getComputedStyle(el);
  return (Object.keys(GROUP_PROPS) as StyleGroupId[]).map((id) => ({
    id,
    title: titleOf(id),
    props: GROUP_PROPS[id]
      .map((k): StyleProp | null => {
        const v = cs.getPropertyValue(k).trim();
        if (!v || DEFAULTS.has(v)) return null;
        const prop: StyleProp = { k, v };
        const sw = swatchOf(v);
        if (sw) prop.swatch = sw;
        return prop;
      })
      .filter((p): p is StyleProp => p !== null),
  }));
}

function titleOf(id: StyleGroupId): string {
  return id === 'bg' ? 'Background' : id[0].toUpperCase() + id.slice(1);
}

function swatchOf(v: string): string | undefined {
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return v;
  if (/^rgba?\(/.test(v) && !v.includes(', 0)')) return v;
  return undefined;
}

export function groupStyle(prop: string): StyleGroupId {
  for (const id of Object.keys(GROUP_PROPS) as StyleGroupId[]) {
    if (GROUP_PROPS[id].includes(prop)) return id;
  }
  return 'other';
}
