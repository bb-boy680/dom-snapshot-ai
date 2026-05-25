#!/usr/bin/env bun
import { rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const DIST = resolve(ROOT, 'dist');
const SRC = resolve(ROOT, 'src');
const PUBLIC_DIR = resolve(ROOT, 'public');
const MINIFY = process.argv.includes('--minify');
const WATCH = process.argv.includes('--watch');

async function clean(): Promise<void> {
  if (existsSync(DIST)) await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
}

async function buildSelector(): Promise<void> {
  const result = await Bun.build({
    entrypoints: [resolve(SRC, 'index.ts')],
    outdir: DIST,
    format: 'iife',
    target: 'browser',
    minify: MINIFY,
    naming: 'selector.js',
    loader: { '.css': 'text' },
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('selector build failed');
  }
}

async function buildBookmarkletHref(): Promise<string> {
  const js = await readFile(resolve(DIST, 'selector.js'), 'utf8');
  return 'javascript:' + encodeURIComponent(js);
}

async function emitIndexHtml(href: string): Promise<void> {
  const tpl = await readFile(resolve(PUBLIC_DIR, 'index.html'), 'utf8');
  const html = tpl.replaceAll('{{BOOKMARKLET_HREF}}', escapeHtmlAttr(href));
  await writeFile(resolve(DIST, 'index.html'), html, 'utf8');
}

function escapeHtmlAttr(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

async function buildOnce(): Promise<void> {
  const t0 = Date.now();
  await clean();
  await buildSelector();
  const href = await buildBookmarkletHref();
  await emitIndexHtml(href);
  const sizeKb = (href.length / 1024).toFixed(1);
  console.log(`✓ build done in ${Date.now() - t0}ms → ${DIST}`);
  console.log(`  bookmarklet size = ${sizeKb} KB (URL-encoded, self-contained)`);
}

async function main(): Promise<void> {
  await buildOnce();

  if (!WATCH) return;

  console.log('… watching src/ and public/ for changes (Ctrl+C to stop)');

  let pending: ReturnType<typeof setTimeout> | null = null;
  let building = false;

  const trigger = (): void => {
    if (pending) clearTimeout(pending);
    pending = setTimeout(() => {
      if (building) {
        trigger();
        return;
      }
      building = true;
      buildOnce()
        .catch((e: unknown) => console.error('✗ rebuild failed:', e))
        .finally(() => {
          building = false;
        });
    }, 80);
  };

  for (const dir of [SRC, PUBLIC_DIR]) {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      console.log(`  change: ${filename}`);
      trigger();
    });
  }
}

await main();
