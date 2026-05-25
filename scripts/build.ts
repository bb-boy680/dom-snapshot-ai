import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');
const isMinify = process.argv.includes('--minify');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

function buildIndexHtml(): void {
  const jsCode = readFileSync('dist/selector.js', 'utf-8');
  const bookmarkletHref = `javascript:void(()=>{${encodeURIComponent(jsCode)}})()`;
  let html = readFileSync('public/index.html', 'utf-8');
  html = html.replace('{{BOOKMARKLET_HREF}}', bookmarkletHref);
  writeFileSync('dist/index.html', html);
}

const cssInlinePlugin: esbuild.Plugin = {
  name: 'css-inline',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      let css = readFileSync(args.path, 'utf-8');
      if (isMinify) {
        const result = await esbuild.transform(css, {
          loader: 'css',
          minify: true,
          target: build.initialOptions.target as string[],
        });
        css = result.code;
      }
      return { contents: `export default ${JSON.stringify(css)}`, loader: 'js' };
    });
  },
};

const htmlPlugin: esbuild.Plugin = {
  name: 'build-index-html',
  setup(build) {
    build.onEnd(() => buildIndexHtml());
  },
};

const sharedConfig: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: isMinify,
  minifyIdentifiers: isMinify,
  minifySyntax: isMinify,
  minifyWhitespace: isMinify,
  treeShaking: true,
  target: ['es2020'],
  outfile: 'dist/selector.js',
  format: 'iife',
  sourcemap: isWatch,
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  loader: {
    '.css': 'text',
  },
  plugins: [cssInlinePlugin, htmlPlugin],
};

if (isWatch) {
  const ctx = await esbuild.context(sharedConfig);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(sharedConfig);
  console.log(`Build complete (${isMinify ? 'minified' : 'development'})`);
}
