type FiberNode = {
  type?: string | Function | null;
  return?: FiberNode | null;
  /** React ≤18: source info object */
  _debugSource?: {
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
  } | null;
  /** React 19: Error object with stack trace */
  _debugStack?: Error | null;
};

type Vue3Instance = {
  type?: { __name?: string; __file?: string };
  parent?: Vue3Instance | null;
};

type Vue2Instance = {
  $options?: { name?: string; __file?: string };
  $parent?: Vue2Instance | null;
};

export interface ComponentSource {
  file?: string;
  line?: number;
}

export interface ComponentPathResult {
  path: string;
  sources: ComponentSource[];
}

/** Names to exclude from the component path — framework internals, DOM wrappers, router plumbing. */
const FRAMEWORK_INTERNALS = new Set([
  // React core
  'Fragment',
  'StrictMode',
  'Suspense',
  'SuspenseList',
  'Profiler',
  'Offscreen',
  'Activity',
  // React context
  'Context.Provider',
  'Context.Consumer',
  'Provider',
  'Consumer',
  // React Router
  'BrowserRouter',
  'HashRouter',
  'MemoryRouter',
  'Router',
  'Routes',
  'Route',
  'RenderedRoute',
  'Outlet',
  'RouteContext',
  // Vue built-ins
  'KeepAlive',
  'Transition',
  'TransitionGroup',
  'Teleport',
  'BaseTransition',
  'Comment',
  'Text',
  'Static',
  'Fragment',
  'Suspense',
  // Vue Router
  'RouterView',
  'RouterLink',
  'RouterOutlet',
  // Nuxt
  'NuxtPage',
  'NuxtLayout',
  'NuxtLink',
  'NuxtLoadingIndicator',
  'NuxtIsland',
  // Angular built-in directives
  'NgFor',
  'NgIf',
  'NgSwitch',
  'NgSwitchCase',
  'NgSwitchDefault',
  'NgClass',
  'NgStyle',
  'NgTemplateOutlet',
  'RouterOutlet',
  'RouterLink',
  'RouterLinkActive',
]);

function isMeaningfulComponent(name: string): boolean {
  if (name[0] >= 'a' && name[0] <= 'z') return false;
  if (name.startsWith('ng-')) return false;
  if (FRAMEWORK_INTERNALS.has(name)) return false;
  return true;
}

export function componentPathFor(el: Element): ComponentPathResult | null {
  return (
    collectReactPath(el) ??
    collectVue3Path(el) ??
    collectVue2Path(el) ??
    collectAngularPath(el) ??
    null
  );
}

// ── React ──────────────────────────────────────────────────────────

function collectReactPath(el: Element): ComponentPathResult | null {
  const fiberKey = Object.keys(el).find(
    (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'),
  );
  if (!fiberKey) return null;

  const entries: { name: string; source?: ComponentSource }[] = [];
  let pendingSource: ComponentSource | undefined;
  let fiber: FiberNode | null | undefined = (el as any)[fiberKey];
  while (fiber) {
    const src = extractReactSource(fiber);
    if (src) pendingSource = src;
    const name = extractTypeName(fiber.type);
    if (name && isMeaningfulComponent(name)) {
      entries.push({ name, source: pendingSource });
      pendingSource = undefined;
    }
    fiber = fiber.return;
  }
  if (entries.length === 0) return null;
  entries.reverse();
  return {
    path: entries.map((e) => e.name).join(' › '),
    sources: entries.map((e) => e.source ?? {}),
  };
}

/**
 * Extract source info from a React fiber.
 * React ≤18: _debugSource is an object { fileName, lineNumber, columnNumber }
 * React 19: _debugStack is an Error whose stack trace contains file:line:col
 */
function extractReactSource(fiber: FiberNode): ComponentSource | undefined {
  // React ≤18
  const src = fiber._debugSource;
  if (src?.fileName) return { file: stripOrigin(src.fileName), line: src.lineNumber };

  // React 19
  const stack = fiber._debugStack;
  if (stack?.stack) {
    return parseReactStack(stack.stack);
  }

  return undefined;
}

/** Strip URL origin (http://localhost:5173) from file paths, keeping only the relative path. */
function stripOrigin(file: string): string {
  try {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return new URL(file).pathname;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return file;
}

/**
 * Parse a React 19 _debugStack to extract user-code file location.
 *
 * Example stack:
 *   Error: react-stack-top-frame
 *       at exports.jsxDEV (react_jsx-dev-runtime.js?v=...:193:83)
 *       at WikiContent (WikiContent.tsx:78:15)
 *
 * We skip react internals (jsxDEV, createElement, etc.) and take the first user frame.
 */
function parseReactStack(stack: string): ComponentSource | undefined {
  const lines = stack.split('\n');
  for (const line of lines) {
    // Skip React internals and empty lines
    if (line.includes('react_jsx') || line.includes('react-dom') || line.includes('react/jsx')) continue;
    // Match: at FunctionName (file:line:col)  OR  at file:line:col
    const m = line.match(/\(([^)]+):(\d+):\d+\)/) ?? line.match(/at\s+([\w./-]+):(\d+):\d+/);
    if (m) {
      const file = stripOrigin(m[1]);
      // Skip node_modules and vite internals
      if (file.includes('node_modules') || file.startsWith('vite:')) continue;
      return { file, line: Number(m[2]) };
    }
  }
  return undefined;
}

// ── Vue 3 ──────────────────────────────────────────────────────────

function collectVue3Path(el: Element): ComponentPathResult | null {
  const inst = (el as any).__vueParentComponent as Vue3Instance | undefined;
  if (!inst) return null;

  const entries: { name: string; source?: ComponentSource }[] = [];
  let cur: Vue3Instance | null | undefined = inst;
  while (cur) {
    const name = cur.type?.__name;
    if (name && isMeaningfulComponent(name)) {
      entries.push({
        name,
        source: cur.type?.__file ? { file: cur.type.__file } : undefined,
      });
    }
    cur = cur.parent;
  }
  if (entries.length === 0) return null;
  entries.reverse();
  return {
    path: entries.map((e) => e.name).join(' › '),
    sources: entries.map((e) => e.source ?? {}),
  };
}

// ── Vue 2 ──────────────────────────────────────────────────────────

function collectVue2Path(el: Element): ComponentPathResult | null {
  const vm = (el as any).__vue__ as Vue2Instance | undefined;
  if (!vm) return null;

  const entries: { name: string; source?: ComponentSource }[] = [];
  let cur: Vue2Instance | null | undefined = vm;
  while (cur) {
    const name = cur.$options?.name;
    if (name && isMeaningfulComponent(name)) {
      entries.push({
        name,
        source: cur.$options?.__file ? { file: cur.$options.__file } : undefined,
      });
    }
    cur = cur.$parent;
  }
  if (entries.length === 0) return null;
  entries.reverse();
  return {
    path: entries.map((e) => e.name).join(' › '),
    sources: entries.map((e) => e.source ?? {}),
  };
}

// ── Angular ────────────────────────────────────────────────────────

function collectAngularPath(el: Element): ComponentPathResult | null {
  const ng = (window as any).ng;
  if (!ng || typeof ng.getComponent !== 'function') return null;

  const entries: { name: string; source?: ComponentSource }[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.documentElement) {
    try {
      const comp = ng.getComponent(cur);
      if (comp) {
        const name = comp.constructor?.name;
        if (name && isMeaningfulComponent(name)) {
          entries.push({ name });
        }
      }
    } catch {
      // ng.getComponent may throw on non-Angular elements
    }
    cur = cur.parentElement;
  }
  if (entries.length === 0) return null;
  entries.reverse();
  return {
    path: entries.map((e) => e.name).join(' › '),
    sources: entries.map((e) => e.source ?? {}),
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function extractTypeName(type: string | Function | null | undefined): string | null {
  if (!type) return null;
  if (typeof type === 'string') return type;
  if (typeof type === 'function') return (type as any).displayName || type.name || null;
  return null;
}
