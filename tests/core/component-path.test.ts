import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { componentPathFor } from '../../src/core/component-path';

describe('componentPathFor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    delete (window as any).ng;
    delete (window as any).__VUE__;
  });

  it('returns null for plain DOM elements without framework', () => {
    document.body.innerHTML = '<div class="card"></div>';
    const el = document.querySelector('.card')!;
    expect(componentPathFor(el)).toBeNull();
  });

  it('detects React component path via __reactFiber$ keys', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      return: {
        type: 'Hero',
        return: {
          type: 'Layout',
          return: null,
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('Layout › Hero › Card');
  });

  it('handles React function components via __reactFiber$', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    function MyCard() {}
    function MyHero() {}

    (el as any)['__reactFiber$test'] = {
      type: MyCard,
      return: {
        type: MyHero,
        return: null,
      },
    };

    expect(componentPathFor(el)?.path).toBe('MyHero › MyCard');
  });

  it('detects Vue 3 component path via __vueParentComponent', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any).__vueParentComponent = {
      type: { __name: 'Card' },
      parent: {
        type: { __name: 'Hero' },
        parent: {
          type: { __name: 'Layout' },
          parent: null,
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('Layout › Hero › Card');
  });

  it('detects Vue 2 component path via __vue__', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any).__vue__ = {
      $options: { name: 'Card' },
      $parent: {
        $options: { name: 'Hero' },
        $parent: {
          $options: { name: 'Layout' },
          $parent: null,
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('Layout › Hero › Card');
  });

  it('detects Angular component via window.ng.getComponent', () => {
    document.body.innerHTML =
      '<app-root><app-hero><app-card id="target"></app-card></app-hero></app-root>';
    const el = document.getElementById('target')!;

    function AppCard() {}
    function AppHero() {}
    function AppRoot() {}
    (window as any).ng = {
      getComponent: (e: Element) => {
        if (e.tagName === 'APP-CARD') return new (AppCard as any)();
        if (e.tagName === 'APP-HERO') return new (AppHero as any)();
        if (e.tagName === 'APP-ROOT') return new (AppRoot as any)();
        return null;
      },
    };

    expect(componentPathFor(el)?.path).toBe('AppRoot › AppHero › AppCard');
  });

  it('returns null when no framework detected', () => {
    document.body.innerHTML = '<section><div id="inner"></div></section>';
    const el = document.getElementById('inner')!;
    expect(componentPathFor(el)).toBeNull();
  });

  it('filters out DOM element names (lowercase) in React path', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      return: {
        type: 'div',
        return: {
          type: 'Layout',
          return: {
            type: 'main',
            return: null,
          },
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('Layout › Card');
  });

  it('filters out React Router internals', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any)['__reactFiber$test'] = {
      type: 'WikiPage',
      return: {
        type: 'RenderedRoute',
        return: {
          type: 'Routes',
          return: {
            type: 'BrowserRouter',
            return: {
              type: 'App',
              return: null,
            },
          },
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('App › WikiPage');
  });

  it('filters out Vue built-in components', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any).__vueParentComponent = {
      type: { __name: 'Card' },
      parent: {
        type: { __name: 'RouterView' },
        parent: {
          type: { __name: 'KeepAlive' },
          parent: {
            type: { __name: 'App' },
            parent: null,
          },
        },
      },
    };

    expect(componentPathFor(el)?.path).toBe('App › Card');
  });

  it('filters out Angular built-in directives', () => {
    document.body.innerHTML = '<app-root><app-card id="target"></app-card></app-root>';
    const el = document.getElementById('target')!;

    function AppCard() {}
    function AppRoot() {}
    (window as any).ng = {
      getComponent: (e: Element) => {
        if (e.tagName === 'APP-CARD') return new (AppCard as any)();
        if (e.tagName === 'APP-ROOT') return new (AppRoot as any)();
        return null;
      },
    };

    expect(componentPathFor(el)?.path).toBe('AppRoot › AppCard');
  });

  it('collects React _debugSource file info', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      _debugSource: { fileName: 'src/Card.tsx', lineNumber: 10, columnNumber: 5 },
      return: {
        type: 'Layout',
        _debugSource: { fileName: 'src/Layout.tsx', lineNumber: 1, columnNumber: 1 },
        return: null,
      },
    };

    const result = componentPathFor(el);
    expect(result?.path).toBe('Layout › Card');
    expect(result?.sources).toEqual([
      { file: 'src/Layout.tsx', line: 1 },
      { file: 'src/Card.tsx', line: 10 },
    ]);
  });

  it('collects Vue 3 __file info', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any).__vueParentComponent = {
      type: { __name: 'Card', __file: 'src/Card.vue' },
      parent: {
        type: { __name: 'App', __file: 'src/App.vue' },
        parent: null,
      },
    };

    const result = componentPathFor(el);
    expect(result?.path).toBe('App › Card');
    expect(result?.sources).toEqual([
      { file: 'src/App.vue' },
      { file: 'src/Card.vue' },
    ]);
  });

  it('sources entry is empty object when no file info', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      return: {
        type: 'Layout',
        _debugSource: { fileName: 'src/Layout.tsx', lineNumber: 5 },
        return: null,
      },
    };

    const result = componentPathFor(el);
    expect(result?.sources).toEqual([
      { file: 'src/Layout.tsx', line: 5 },
      {},
    ]);
  });

  it('attaches DOM element _debugSource to parent component', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    // h1 (DOM element, filtered) has _debugSource pointing to HeadingWrapper's source
    // HeadingWrapper (component) has no _debugSource
    (el as any)['__reactFiber$test'] = {
      type: 'h1',
      _debugSource: { fileName: 'src/HeadingWrapper.tsx', lineNumber: 15 },
      return: {
        type: 'HeadingWrapper',
        // no _debugSource here
        return: {
          type: 'Markdown',
          _debugSource: { fileName: 'src/Markdown.tsx', lineNumber: 8 },
          return: null,
        },
      },
    };

    const result = componentPathFor(el);
    expect(result?.path).toBe('Markdown › HeadingWrapper');
    expect(result?.sources).toEqual([
      { file: 'src/Markdown.tsx', line: 8 },
      { file: 'src/HeadingWrapper.tsx', line: 15 },
    ]);
  });

  it('collects React 19 _debugStack file info', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    const mkStack = (frame: string) =>
      Object.assign(new Error('react-stack-top-frame'), {
        stack: `Error: react-stack-top-frame\n    at exports.jsxDEV (react_jsx-dev-runtime.js?v=abc:193:83)\n    at ${frame}`,
      });

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      _debugStack: mkStack('Card (src/Card.tsx:42:10)'),
      return: {
        type: 'Layout',
        _debugStack: mkStack('Layout (src/Layout.tsx:5:1)'),
        return: null,
      },
    };

    const result = componentPathFor(el);
    expect(result?.path).toBe('Layout › Card');
    expect(result?.sources).toEqual([
      { file: 'src/Layout.tsx', line: 5 },
      { file: 'src/Card.tsx', line: 42 },
    ]);
  });

  it('React 19 _debugStack: attaches DOM element source to parent component', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    const mkStack = (frame: string) =>
      Object.assign(new Error('react-stack-top-frame'), {
        stack: `Error: react-stack-top-frame\n    at exports.jsxDEV (react_jsx-dev-runtime.js?v=abc:193:83)\n    at ${frame}`,
      });

    (el as any)['__reactFiber$test'] = {
      type: 'h1',
      _debugStack: mkStack('HeadingWrapper (src/HeadingWrapper.tsx:15:3)'),
      return: {
        type: 'HeadingWrapper',
        return: {
          type: 'Markdown',
          _debugStack: mkStack('Markdown (src/Markdown.tsx:8:1)'),
          return: null,
        },
      },
    };

    const result = componentPathFor(el);
    expect(result?.path).toBe('Markdown › HeadingWrapper');
    expect(result?.sources).toEqual([
      { file: 'src/Markdown.tsx', line: 8 },
      { file: 'src/HeadingWrapper.tsx', line: 15 },
    ]);
  });

  it('React 19 _debugStack: skips react internal frames', () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = document.getElementById('target')!;

    const error = Object.assign(new Error('react-stack-top-frame'), {
      stack: [
        'Error: react-stack-top-frame',
        '    at exports.jsxDEV (react_jsx-dev-runtime.js?v=abc:193:83)',
        '    at exports.createElement (react-dom.js?v=abc:100:5)',
        '    at Card (src/Card.tsx:10:5)',
      ].join('\n'),
    });

    (el as any)['__reactFiber$test'] = {
      type: 'Card',
      _debugStack: error,
      return: null,
    };

    const result = componentPathFor(el);
    expect(result?.sources).toEqual([{ file: 'src/Card.tsx', line: 10 }]);
  });
});
