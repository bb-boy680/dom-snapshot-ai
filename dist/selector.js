(()=>{var or=`:host, * { box-sizing: border-box; }

:host {
  --primary: #0066cc;
  --primary-focus: #0071e3;
  --ink: #1d1d1f;
  --ink-muted-80: #333;
  --ink-muted-48: #7a7a7a;
  --hairline: #e0e0e0;
  --divider-soft: #f0f0f0;
  --canvas: #fff;
  --canvas-parchment: #f5f5f7;
  --surface-chip: rgba(0, 0, 0, 0.04);
  --surface-chip-strong: rgba(0, 0, 0, 0.06);
  --surface-pearl: #fafafc;

  --font-display: 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-text: 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

/* =========================================================
   Floating Panel (mockups/panel.html)
   ========================================================= */
.panel-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 328px;
  background: var(--canvas);
  border-radius: 16px;
  border: 1px solid var(--hairline);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 12px 36px rgba(0, 0, 0, 0.10);
  font-family: var(--font-text);
  font-size: 14px;
  color: var(--ink);
  z-index: 2147483647;
}

.panel-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--divider-soft);
}
.panel-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--ink);
  letter-spacing: -0.08px;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #34c759;
}
.panel-ctrls { display: flex; gap: 4px; }
.panel-ctrls button {
  width: 22px; height: 22px; border: 0; border-radius: 6px;
  background: transparent; color: var(--ink-muted-48);
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 120ms;
}
.panel-ctrls button:hover { background: var(--surface-chip); color: var(--ink); }
.panel-ctrls svg { width: 12px; height: 12px; }

.panel-shortcuts {
  padding: 10px 14px 12px;
  display: flex; flex-wrap: wrap; gap: 6px;
  border-bottom: 1px solid var(--divider-soft);
}
.kbd-group {
  display: inline-flex; align-items: center; gap: 4px;
  height: 20px; padding: 0 7px 0 5px;
  background: var(--surface-chip); border-radius: 5px;
  font-size: 11px; color: var(--ink-muted-80);
  letter-spacing: -0.08px; line-height: 1; white-space: nowrap;
}
.kbd {
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 500;
  color: var(--ink); line-height: 1;
}

.panel-editor-wrap { padding: 12px 14px 14px; }
.panel-editor {
  width: 100%; min-height: 96px;
  border: 0; outline: 0; background: transparent;
  font-family: var(--font-text); font-size: 14px; line-height: 28px;
  color: var(--ink); letter-spacing: -0.224px;
  padding: 0; cursor: text;
  word-break: break-word; white-space: pre-wrap;
}
.panel-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--ink-muted-48); pointer-events: none;
}

.tag {
  display: inline-flex; align-items: center; gap: 5px;
  height: 22px; padding: 0 4px 0 7px; margin: 0 2px;
  vertical-align: middle; position: relative; top: -1px;
  background: rgba(0, 102, 204, 0.07); color: var(--primary);
  border: 1px solid rgba(0, 102, 204, 0.22); border-radius: 5px;
  font-family: var(--font-mono); font-size: 11.5px; line-height: 1;
  letter-spacing: -0.08px; white-space: nowrap;
  user-select: none; cursor: default;
  box-shadow: 0 1px 0 rgba(0, 102, 204, 0.04);
  transition: background 120ms, border-color 120ms;
}
.tag:hover {
  background: rgba(0, 102, 204, 0.11);
  border-color: rgba(0, 102, 204, 0.35);
}
.tag::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: #34c759; flex-shrink: 0;
}
.tag-meta {
  display: inline-flex; align-items: center; gap: 3px;
  height: 16px; padding: 0 5px;
  background: rgba(0, 102, 204, 0.12); color: var(--primary);
  border-radius: 3px;
  font-size: 10px; font-weight: 500; line-height: 1;
  margin-left: 1px;
}
.tag .tag-x {
  width: 14px; height: 14px; border-radius: 3px;
  border: 0; background: transparent; color: inherit;
  cursor: pointer; opacity: 0.55; padding: 0; margin-left: 2px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 120ms, opacity 120ms;
}
.tag .tag-x:hover { background: rgba(0, 102, 204, 0.18); opacity: 1; }
.tag .tag-x svg { width: 7px; height: 7px; }

/* SVG icon inside chip meta (Style indicator) */
.tag-meta svg {
  width: 8px; height: 8px;
  stroke: currentColor; stroke-width: 1.6; fill: none;
  stroke-linecap: round; stroke-linejoin: round;
}

/* Hover tooltip — snapshot preview */
.tag-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: 260px;
  background: var(--ink); color: #fff;
  border-radius: 10px; padding: 10px 12px;
  font-family: var(--font-text); font-size: 11.5px; line-height: 1.5;
  letter-spacing: -0.08px; text-align: left; white-space: normal;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  opacity: 0; pointer-events: none;
  transition: opacity 140ms, transform 140ms;
  z-index: 30;
}
.tag-tooltip::after {
  content: ""; position: absolute;
  bottom: -4px; left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px; height: 8px; background: var(--ink);
}
.tag:hover .tag-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.tag-tooltip.tooltip-below {
  bottom: auto; top: calc(100% + 8px);
  transform: translateX(-50%) translateY(-4px);
}
.tag-tooltip.tooltip-below::after {
  bottom: auto; top: -4px;
}
.tag:hover .tag-tooltip.tooltip-below {
  transform: translateX(-50%) translateY(0);
}
.tt-row {
  display: flex; align-items: baseline; gap: 8px; padding: 3px 0;
}
.tt-row + .tt-row { border-top: 1px solid rgba(255, 255, 255, 0.08); }
.tt-key {
  color: rgba(255, 255, 255, 0.55);
  font-size: 10.5px; flex-shrink: 0; min-width: 44px;
}
.tt-val {
  color: #fff;
  font-family: var(--font-mono); font-size: 11px;
  word-break: break-all;
}
.tt-empty {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}
.tt-pill {
  display: inline-block;
  padding: 1px 5px;
  margin: 0 3px 3px 0;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  font-size: 10px;
  line-height: 14px;
}

/* Dock wrapper (icon-only; collapsed = inspection paused) */
.dock-wrap { display: contents; }

/* Toast error variant */
.toast.toast-error svg { color: #ff453a; }
.toast.toast-error { color: #fff; }

.panel-footer {
  padding: 12px 14px 14px;
  border-top: 1px solid var(--divider-soft);
}
.copy-btn {
  width: 100%; height: 36px; border: 0; border-radius: 9999px;
  background: var(--surface-chip); color: var(--ink-muted-48);
  font-family: var(--font-text); font-size: 14px; font-weight: 500;
  letter-spacing: -0.224px; cursor: pointer;
  transition: transform 120ms, background 120ms, color 120ms;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.copy-btn.is-ready { background: var(--primary); color: #fff; }
.copy-btn.is-ready:hover { background: var(--primary-focus); }
.copy-btn:not(:disabled):active { transform: scale(0.97); }
.copy-btn:disabled { cursor: not-allowed; }
.copy-btn svg { width: 13px; height: 13px; }

.toast {
  position: fixed; left: 50%; bottom: 96px;
  transform: translateX(-50%);
  background: var(--ink); color: #fff;
  font-size: 13px; letter-spacing: -0.08px;
  padding: 10px 16px; border-radius: 10px;
  display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  z-index: 2147483647;
  animation: toast-in 220ms ease-out;
}
.toast svg { width: 13px; height: 13px; color: #34c759; }
@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Docked / collapsed icon */
.dock-icon {
  position: fixed; top: 50%; right: 0;
  transform: translateY(-50%);
  width: 40px; height: 44px;
  background: var(--canvas);
  border: 1px solid var(--hairline); border-right: 0;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 6px 18px rgba(0, 0, 0, 0.08);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; color: var(--ink);
  transition: transform 120ms, background 120ms, padding 120ms;
  z-index: 2147483647;
}
.dock-icon:hover { background: var(--surface-pearl); padding-right: 4px; }
.dock-icon:active { transform: translateY(-50%) scale(0.97); }
.dock-icon svg { width: 18px; height: 18px; }

/* =========================================================
   Selection Toolbar + popcards (mockups/selection-toolbar.html)
   ========================================================= */
.toolbar {
  position: fixed;
  display: inline-flex; align-items: stretch;
  background: var(--ink); color: #fff; border-radius: 9px;
  height: 32px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.20), 0 1px 2px rgba(0, 0, 0, 0.08);
  font-family: var(--font-text); font-size: 13px; white-space: nowrap;
  z-index: 2147483647;
}
.tb-selector {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 12px;
  font-family: var(--font-mono); font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
  max-width: 280px; overflow: hidden; text-overflow: ellipsis;
}
.sel-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--primary); flex-shrink: 0;
}
.sel-dot.attached { background: #34c759; }
.tb-divider { width: 1px; background: rgba(255, 255, 255, 0.12); margin: 6px 0; }
.tb-btn + .tb-btn { box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.12); }
.tb-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.86);
  background: transparent; border: 0; cursor: pointer;
  font-family: inherit; font-size: 13px;
  transition: background 120ms, color 120ms, transform 120ms;
}
.tb-btn:hover { background: rgba(255, 255, 255, 0.10); color: #fff; }
.tb-btn:active { transform: scale(0.97); }
.tb-btn.is-active { background: var(--primary); color: #fff; }
.tb-btn.has-note { color: #6ec1ff; }
.tb-btn.has-note::before {
  content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: #6ec1ff; margin-right: 4px;
  box-shadow: 0 0 0 2px rgba(110, 193, 255, 0.18);
}
.tb-btn.is-active.has-note { color: #fff; }
.tb-btn.is-active.has-note::before { background: #fff; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25); }
.tb-attach {
  background: var(--primary); color: #fff;
  font-weight: 500;
}
.tb-attach:hover { background: var(--primary-focus); color: #fff; }
.tb-attach.is-done { background: rgba(52, 199, 89, 0.22); color: #34c759; }
.tb-attach.is-done:hover { background: rgba(52, 199, 89, 0.32); color: #34c759; }
.tb-btn svg {
  width: 13px; height: 13px;
  stroke: currentColor; stroke-width: 1.6; fill: none;
  stroke-linecap: round; stroke-linejoin: round;
}
.tb-btn-icon { padding: 0 10px; }
.tb-sub {
  display: inline-flex; align-items: center;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-mono); font-size: 11px; line-height: 1;
  margin-left: 4px;
}
.tb-btn.is-attached .tb-sub { color: rgba(110, 193, 255, 0.7); }
.tb-btn.has-note .tb-sub { color: rgba(110, 193, 255, 0.7); }

.popcard {
  position: fixed;
  width: 320px;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  overflow: visible;
  z-index: 2147483647;
  font-family: var(--font-text); color: var(--ink);
}
.popcard.from-style { width: 480px; }

/* Arrow that points back to the toolbar button it grew from. */
.popcard::before {
  content: "";
  position: absolute;
  width: 12px; height: 12px;
  background: var(--canvas);
  border-left: 1px solid var(--hairline);
  border-top: 1px solid var(--hairline);
  transform: rotate(45deg);
  top: -6px;
  left: var(--arrow-x, 96px);
}
/* When the card sits above its toolbar, the arrow flips to the bottom edge. */
.popcard.arrow-bottom::before {
  top: auto; bottom: -6px;
  border-left: 0; border-top: 0;
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
}

.popcard-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid var(--divider-soft);
  background: var(--canvas); border-radius: 14px 14px 0 0;
  position: relative;
}
.popcard-title {
  font-size: 11px; font-weight: 600; color: var(--ink-muted-80);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.popcard-meta {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted-48);
}

/* Edit popcard */
.edit-body { padding: 12px 14px; }
.edit-body textarea {
  width: 100%; min-height: 84px;
  border: 1px solid var(--hairline); border-radius: 8px;
  padding: 10px 12px;
  font-family: var(--font-text); font-size: 13.5px;
  color: var(--ink); line-height: 1.5;
  resize: vertical; outline: 0;
  background: var(--canvas);
  transition: border-color 120ms, box-shadow 120ms;
}
.edit-body textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.12);
}
.edit-actions {
  display: flex; gap: 8px; padding: 0 14px 14px; justify-content: flex-end;
}
.edit-actions button {
  height: 30px; padding: 0 14px;
  border: 0; border-radius: 9999px;
  font-family: var(--font-text); font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: background 120ms, transform 120ms;
}
.edit-actions button:active { transform: scale(0.96); }
.edit-actions .ghost { background: transparent; color: var(--ink-muted-80); }
.edit-actions .ghost:hover { background: var(--surface-chip); }
.edit-actions .primary { background: var(--primary); color: #fff; }
.edit-actions .primary:hover { background: var(--primary-focus); }

/* Style popcard */
.style-split { display: grid; grid-template-columns: 156px 1fr; min-height: 240px; }
.style-groups {
  border-right: 1px solid var(--divider-soft);
  padding: 6px; display: flex; flex-direction: column; gap: 2px;
  background: rgba(0, 0, 0, 0.015);
}
.style-group {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 7px;
  cursor: pointer; transition: background 120ms;
  font-size: 13px; color: var(--ink-muted-80);
}
.style-group:hover { background: rgba(0, 0, 0, 0.03); color: var(--ink); }
.style-group.is-active {
  background: var(--canvas); color: var(--ink);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.sg-name { flex: 1; font-weight: 500; }
.sg-count {
  font-family: var(--font-mono); font-size: 10.5px;
  color: var(--ink-muted-48);
  padding: 1px 6px; background: var(--surface-chip);
  border-radius: 9999px;
  min-width: 28px; text-align: center;
}
.style-group.is-active .sg-count {
  background: rgba(0, 102, 204, 0.10); color: var(--primary);
}
.style-group.has-selection .sg-count {
  background: var(--primary); color: #fff;
}
.style-props {
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
  max-height: 280px; overflow-y: auto;
}
.style-props-head {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; color: var(--ink-muted-48);
}
.sp-title {
  font-weight: 600; color: var(--ink-muted-80);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.sp-toggle {
  border: 0; background: transparent; color: var(--primary);
  font-size: 11.5px; cursor: pointer; padding: 0; font-weight: 500;
}
.sp-toggle:hover { color: var(--primary-focus); }
.prop-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.prop-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px 5px 8px;
  background: var(--canvas-parchment);
  border: 1px solid var(--hairline); border-radius: 7px;
  font-family: var(--font-mono); font-size: 11.5px;
  color: var(--ink-muted-80);
  cursor: pointer; user-select: none;
  transition: background 120ms, border-color 120ms, color 120ms;
}
.prop-chip:hover { border-color: var(--ink-muted-48); color: var(--ink); }
.prop-chip input {
  appearance: none; -webkit-appearance: none;
  width: 11px; height: 11px; border-radius: 3px;
  border: 1.4px solid var(--ink-muted-48); margin: 0;
  position: relative; cursor: pointer; flex-shrink: 0;
}
.prop-chip input:checked {
  background: var(--primary); border-color: var(--primary);
}
.prop-chip input:checked::after {
  content: ""; position: absolute; left: 2px; top: 0;
  width: 4px; height: 7px;
  border: solid #fff; border-width: 0 1.6px 1.6px 0;
  transform: rotate(45deg);
}
.prop-chip.is-on {
  background: rgba(0, 102, 204, 0.08);
  border-color: rgba(0, 102, 204, 0.30);
  color: var(--primary);
}
.prop-key { font-weight: 500; }
.prop-val { color: var(--ink-muted-48); }
.prop-chip.is-on .prop-val { color: var(--primary); opacity: 0.75; }
.prop-swatch {
  width: 9px; height: 9px; border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.10);
}
.style-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--divider-soft);
  background: rgba(0, 0, 0, 0.015);
}
.all-toggle {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--ink-muted-80);
  cursor: pointer; user-select: none;
}
.all-toggle input { accent-color: var(--primary); margin: 0; }
.footer-meta {
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted-48);
  margin-left: auto;
}
.add-btn {
  height: 26px; padding: 0 12px;
  border: 0; border-radius: 9999px;
  background: var(--primary); color: #fff;
  font-family: var(--font-text); font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: background 120ms, transform 120ms;
}
.add-btn:hover { background: var(--primary-focus); }
.add-btn:active { transform: scale(0.96); }

/* HTML popcard */
.html-hint {
  margin: 10px 14px 0;
  font-size: 11.5px; color: var(--ink-muted-48); line-height: 1.5;
}
.html-tabs {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  padding: 10px 14px 0;
}
.html-tab {
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  padding: 8px 10px;
  background: var(--canvas-parchment);
  border: 1px solid var(--hairline); border-radius: 8px;
  cursor: pointer; text-align: left;
  font-family: var(--font-text);
  transition: border-color 120ms, background 120ms;
}
.html-tab:hover { border-color: var(--ink-muted-48); }
.ht-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; color: var(--ink);
}
.ht-label::before {
  content: ""; width: 8px; height: 8px; border-radius: 50%;
  border: 1.5px solid var(--ink-muted-48);
  display: inline-block; flex-shrink: 0;
}
.ht-desc { font-size: 10.5px; color: var(--ink-muted-48); line-height: 1.35; }
.html-tab.is-on { background: rgba(0, 102, 204, 0.06); border-color: var(--primary); }
.html-tab.is-on .ht-label { color: var(--primary); }
.html-tab.is-on .ht-label::before {
  background: var(--primary); border-color: var(--primary);
  box-shadow: inset 0 0 0 2px #fff;
}
.html-tab.is-on .ht-desc { color: var(--primary); opacity: 0.75; }
.html-code-wrap { margin: 10px 14px 0; }
.html-code {
  padding: 12px;
  background: var(--canvas-parchment); border-radius: 8px;
  font-family: var(--font-mono); font-size: 11.5px;
  color: var(--ink); line-height: 1.6;
  white-space: pre-wrap; word-break: break-word;
  max-height: 180px; overflow: auto; margin: 0;
}
.html-code .html-tag   { color: var(--primary); }
.html-code .html-punct { color: var(--primary); opacity: 0.7; }
.html-code .html-attr  { color: #b34a00; }
.html-code .html-str   { color: #2d8c5e; }
.html-code .html-val   { color: #2d8c5e; }
.html-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 12px; margin-top: 10px;
  border-top: 1px solid var(--divider-soft);
}
.html-meta { font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted-48); }
.html-attach {
  height: 26px; padding: 0 12px;
  border: 0; border-radius: 9999px;
  background: var(--primary); color: #fff;
  font-family: var(--font-text); font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: background 120ms, transform 120ms, color 120ms;
}
.html-attach:hover { background: var(--primary-focus); }
.html-attach:active { transform: scale(0.96); }
.html-attach.is-attached {
  background: var(--surface-chip-strong);
  color: var(--ink-muted-80);
}
.html-attach.is-attached:hover { background: rgba(0, 0, 0, 0.10); color: var(--ink); }
`;function nr(r){let o=[],p=r;while(p&&p.nodeType===1&&p!==document.documentElement){if(o.unshift(xr(p)),p.id)break;p=p.parentElement}return o.join(" > ")}function ar(r){return xr(r)}function xr(r){let o=r.tagName.toLowerCase();if(r.id)return`${o}#${pr(r.id)}`;let p=Array.from(r.classList).filter((i)=>!/^[0-9]/.test(i)&&i.length<32).slice(0,2).map(pr);if(p.length)return`${o}.${p.join(".")}`;let n=r.parentElement;if(!n)return o;let a=Array.from(n.children).filter((i)=>i.tagName===r.tagName);if(a.length===1)return o;let f=a.indexOf(r)+1;return`${o}:nth-of-type(${f})`}function pr(r){if(typeof CSS<"u"&&CSS.escape)return CSS.escape(r);return r.replace(/([^\w-])/g,"\\$1")}var P={layout:["display","position","top","right","bottom","left","width","height","min-width","min-height","max-width","max-height","margin","padding","flex-direction","flex-wrap","flex","gap","justify-content","align-items","align-self","grid-template-columns","grid-template-rows","grid-column","grid-row","box-sizing"],text:["font-family","font-size","font-weight","font-style","line-height","letter-spacing","text-align","text-decoration","text-transform","color","white-space","word-break"],bg:["background-color","background-image","background-size","background-position","background-repeat","background-attachment"],border:["border","border-width","border-style","border-color","border-top","border-right","border-bottom","border-left","border-radius","outline","outline-offset"],effects:["opacity","transform","transition","animation","box-shadow","filter","backdrop-filter","mix-blend-mode"],other:["cursor","z-index","overflow","overflow-x","overflow-y","pointer-events","visibility","user-select"]},Pr=new Set(["none","auto","normal","visible","0px","0","0% 0%","rgba(0, 0, 0, 0)","transparent","repeat","scroll","static","currentcolor","baseline","stretch","flex-start"]);function fr(r){let o=getComputedStyle(r);return Object.keys(P).map((p)=>({id:p,title:Rr(p),props:P[p].map((n)=>{let a=o.getPropertyValue(n).trim();if(!a||Pr.has(a))return null;let f={k:n,v:a},i=Lr(a);if(i)f.swatch=i;return f}).filter((n)=>n!==null)}))}function Rr(r){return r==="bg"?"Background":r[0].toUpperCase()+r.slice(1)}function Lr(r){if(/^#[0-9a-f]{3,8}$/i.test(r))return r;if(/^rgba?\(/.test(r)&&!r.includes(", 0)"))return r;return}function ir(r){for(let o of Object.keys(P))if(P[o].includes(r))return o;return"other"}var gr=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);function V(r,o="simplified"){let p=o==="simplified"?_r(r):Cr(r);return{html:p,lineCount:p.split(`
`).length,charCount:p.length}}function _r(r){let o=r.tagName.toLowerCase(),p=sr(r);if(gr.has(o))return`<${o}${p}>`;let n=r.innerHTML.trim(),a=n.length>200?n.slice(0,200)+"…":n;if(a.includes(`
`))return`<${o}${p}>
${a}
</${o}>`;return`<${o}${p}>${a}</${o}>`}function Cr(r){return hr(r,0)}function hr(r,o){let p="  ".repeat(o);if(r.nodeType===3){let g=C(r.textContent??"");return g?p+br(g):""}if(r.nodeType!==1)return"";let n=r,a=n.tagName.toLowerCase(),f=sr(n);if(gr.has(a))return`${p}<${a}${f}>`;let i=Array.from(n.childNodes).filter((g)=>{if(g.nodeType!==3)return!0;return C(g.textContent??"").length>0});if(i.length===0)return`${p}<${a}${f}></${a}>`;if(i.every((g)=>g.nodeType===3)){let g=i.map((b)=>C(b.textContent??"")).join(" ");return`${p}<${a}${f}>${br(g)}</${a}>`}let s=i.map((g)=>hr(g,o+1)).filter(Boolean).join(`
`);return`${p}<${a}${f}>
${s}
${p}</${a}>`}function sr(r){return Array.from(r.attributes).map((o)=>` ${o.name}="${o.value}"`).join("")}function C(r){return r.replace(/\s+/g," ").trim()}function br(r){return r.length>100?r.slice(0,100)+"…":r}var u={items:[],panelCollapsed:!1,panelOpen:!0,activeId:null,enabled:!0},$=new Map,F=new Map,S=new Set,Sr=0;function t(){S.forEach((r)=>r(u))}function q(r){return S.add(r),r(u),()=>S.delete(r)}function k(){return u}function Z(r){return $.get(r)}function O(r){let o=F.get(r);if(o)return o;let p=$.get(r);if(!p)return[];let n=fr(p);return F.set(r,n),n}function A(r,o=!1){for(let[a,f]of $)if(f===r){if(u.activeId=a,o)u.items=u.items.map((i)=>i.id===a?{...i,committed:!0}:i);return t(),a}u.items.filter((a)=>!a.committed).forEach((a)=>{$.delete(a.id),F.delete(a.id)}),u.items=u.items.filter((a)=>a.committed);let p=`sel_${++Sr}`;$.set(p,r);let n=V(r,"simplified");return u.items=[...u.items,{id:p,selector:nr(r),label:ar(r),styles:[],htmlMode:"simplified",htmlSnap:n,htmlAttached:!0,committed:o,note:""}],u.activeId=p,t(),p}function vr(r){u.items=u.items.map((o)=>o.id===r?{...o,committed:!0}:o),t()}function ur(r){u.items=u.items.map((o)=>o.id===r?{...o,committed:!1}:o),t()}function H(r){if($.delete(r),F.delete(r),u.items=u.items.filter((o)=>o.id!==r),u.activeId===r)u.activeId=null;t()}function Q(r){u.activeId=r,t()}function R(r,o){u.items=u.items.map((p)=>p.id===r?{...p,styles:o}:p),t()}function yr(r,o){let p=$.get(r);if(!p)return;let n=V(p,o);u.items=u.items.map((a)=>a.id===r?{...a,htmlMode:o,htmlSnap:n}:a),t()}function wr(r,o){u.items=u.items.map((p)=>p.id===r?{...p,htmlAttached:o}:p),t()}function cr(r,o){u.items=u.items.map((p)=>p.id===r?{...p,note:o}:p),t()}function U(r){u.panelCollapsed=r,t()}function M(r){if(u.enabled===r)return;u.enabled=r,t()}function L(){$.clear(),F.clear(),u.items=[],u.activeId=null,t()}var I=new Set;function G(r){I.forEach((o)=>o(r))}function dr(r){return I.add(r),()=>I.delete(r)}function T(r,o){let p=new Map(o.map((f)=>[f.id,f])),n="",a=!1;for(let f of r){if(f.kind==="text"){n+=a&&f.value&&!f.value.startsWith(`
`)?`
${f.value}`:f.value,a=!1;continue}let i=p.get(f.id);if(!i)continue;let s=Ir(i);n+=n.endsWith(`
`)||n===""?s:`
${s}`,a=!0}return n}function Ir(r){let o=[];if(o.push(`# Element: ${Ar(r)}`),o.push(`- **URL**: ${Or()}`),o.push(""),o.push(`- **selector**: ${r.selector}`),o.push(""),r.note.trim())o.push("- **Modification Request**:"),o.push("```text"),o.push(r.note.trim()),o.push("```"),o.push("");if(r.styles.length)o.push("- **Computed Styles**:"),o.push("```css"),r.styles.forEach((p)=>o.push(`${p.k}: ${p.v};`)),o.push("```"),o.push("");if(r.htmlAttached)o.push(`- **HTML (${r.htmlMode})**:`),o.push("```html"),o.push(r.htmlSnap.html),o.push("```");return o.join(`
`)}function Or(){try{return typeof location<"u"?location.pathname:"/"}catch{return"/"}}function Ar(r){let o=Hr(r.htmlSnap.html);if(o)return o;return`<${(r.selector.split(">").pop()?.trim()??"").split(/[.#[:\s]/,1)[0]||"element"}>`}function Hr(r){let o=r.match(/<[a-zA-Z][^>]*>/);return o?o[0]:""}function zr(r){try{let o=localStorage.getItem(r);return o?JSON.parse(o):null}catch{return null}}function lr(r,o){try{localStorage.setItem(r,JSON.stringify(o))}catch{}}var kr=()=>zr("__dsai_panel_pos__"),tr=()=>zr("__dsai_dock_pos__");function jr(r,o){if(!o)return;let{left:p,top:n}=$r(r,o.left,o.top);r.style.left=`${p}px`,r.style.top=`${n}px`,r.style.right="auto",r.style.bottom="auto"}function Xr(r,o){o.style.cursor="grab",o.addEventListener("pointerdown",(p)=>{if(p.target.closest("button"))return;if(p.button!==0)return;p.preventDefault();let n=r.getBoundingClientRect(),a=p.clientX-n.left,f=p.clientY-n.top;r.style.left=`${n.left}px`,r.style.top=`${n.top}px`,r.style.right="auto",r.style.bottom="auto",o.style.cursor="grabbing";let i=(g)=>{let{left:b,top:h}=$r(r,g.clientX-a,g.clientY-f);r.style.left=`${b}px`,r.style.top=`${h}px`},s=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",s),o.style.cursor="grab",lr("__dsai_panel_pos__",{left:parseFloat(r.style.left),top:parseFloat(r.style.top)})};window.addEventListener("pointermove",i),window.addEventListener("pointerup",s)})}function $r(r,o,p){let{offsetWidth:n,offsetHeight:a}=r,f=window.innerWidth-n-8,i=window.innerHeight-a-8;return{left:Math.max(8,Math.min(f,o)),top:Math.max(8,Math.min(i,p))}}function Qr(r,o){if(!o)return;Zr(r,o.side,o.top,!1)}function Yr(r){r.style.cursor="grab";let o=3,p=!1,n=!1,a=0,f=0,i=0,s=0;r.addEventListener("pointerdown",(b)=>{if(b.button!==0)return;p=!0,n=!1,a=b.clientX,f=b.clientY;let h=r.getBoundingClientRect();i=b.clientX-h.left,s=b.clientY-h.top,r.setPointerCapture?.(b.pointerId)}),r.addEventListener("pointermove",(b)=>{if(!p)return;if(!n){if(Math.hypot(b.clientX-a,b.clientY-f)<o)return;n=!0;let Y=r.getBoundingClientRect();r.style.transform="none",r.style.transition="none",r.style.right="auto",r.style.top=`${Y.top}px`,r.style.left=`${Y.left}px`,r.style.cursor="grabbing"}let{offsetWidth:h,offsetHeight:y}=r,d=Math.max(0,Math.min(window.innerWidth-h,b.clientX-i)),l=Math.max(8,Math.min(window.innerHeight-y-8,b.clientY-s));r.style.left=`${d}px`,r.style.top=`${l}px`});let g=(b)=>{if(!p)return;if(p=!1,r.releasePointerCapture?.(b.pointerId),r.style.cursor="grab",!n)return;let h=r.getBoundingClientRect(),d=h.left+h.width/2<window.innerWidth/2?"left":"right",l=Math.max(8,Math.min(window.innerHeight-h.height-8,h.top));Zr(r,d,l,!0),lr("__dsai_dock_pos__",{side:d,top:l})};r.addEventListener("pointerup",g),r.addEventListener("pointercancel",g),r.addEventListener("click",(b)=>{if(n)b.stopImmediatePropagation(),b.preventDefault(),n=!1},!0)}function Zr(r,o,p,n){let a=r.offsetWidth,f=o==="left"?0:window.innerWidth-a;if(o==="left")r.style.borderRadius="0 12px 12px 0",r.style.borderLeft="0",r.style.borderRight="";else r.style.borderRadius="12px 0 0 12px",r.style.borderRight="0",r.style.borderLeft="";if(r.style.transform="none",r.style.right="auto",n)r.style.transition="left 180ms cubic-bezier(.2,.8,.2,1), top 180ms cubic-bezier(.2,.8,.2,1)",requestAnimationFrame(()=>{r.style.left=`${f}px`,r.style.top=`${p}px`}),window.setTimeout(()=>{r.style.transition=""},220);else r.style.left=`${f}px`,r.style.top=`${p}px`}var Tr=[["Click","Select"],["⇧","Multi"],["←↑↓→","Navigate"],["Space","Pause"],["⌘C","Copy"],["Esc","Clear"]];function Jr(r,o){let p=document.createElement("div");r.appendChild(p);let n=null,a=0,f=null,i=null,s=null,g=(w,x)=>{n={kind:w,text:x},b(),window.clearTimeout(a),a=window.setTimeout(()=>{n=null,b()},1800)},b=()=>{let w=k();if(!w.panelOpen){p.innerHTML="",i=null,s=null,f?.unmount(),f=null;return}if(w.panelCollapsed){if(f?.syncFromStore(w.items),i)i.style.display="none";l(),Y();return}if(s)s.remove(),s=null;if(!i)h();else i.style.display="";f?.syncFromStore(w.items),y(w.items.filter((x)=>x.committed).length),Y()};function h(){i=document.createElement("div"),i.className="panel-root",i.innerHTML=`
      <div class="panel-titlebar">
        <div class="panel-title"><span class="status-dot"></span>Selecting</div>
        <div class="panel-ctrls">
          <button data-act="min" title="Minimize">
            <svg viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <button data-act="close" title="Close">
            <svg viewBox="0 0 12 12"><line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      <div class="panel-shortcuts">
        ${Tr.map(([v,c])=>`<span class="kbd-group"><span class="kbd">${W(v)}</span>${W(c)}</span>`).join("")}
      </div>
      <div class="panel-editor-wrap">
        <div class="panel-editor" contenteditable="true" data-placeholder="点击页面元素 → toolbar 中 Attach 将 chip 插入当前光标位置…"></div>
      </div>
      <div class="panel-footer">
        <button class="copy-btn" data-act="copy" disabled>Copy Prompt</button>
      </div>
    `,p.appendChild(i);let w=i.querySelector(".panel-titlebar");Xr(i,w),requestAnimationFrame(()=>jr(i,kr()));let x=i.querySelector(".panel-editor");f=new qr(x),f.mount(),i.querySelector('[data-act="min"]').addEventListener("click",()=>{U(!0),M(!1)}),i.querySelector('[data-act="close"]').addEventListener("click",()=>{o()}),i.querySelector('[data-act="copy"]').addEventListener("click",()=>{if(!f)return;let v=f.serialize(),c=T(v,k().items);navigator.clipboard.writeText(c).then(()=>g("success","已复制到剪贴板"),()=>g("error","复制失败"))}),x.addEventListener("input",()=>{y(k().items.filter((v)=>v.committed).length)})}function y(w){let x=i?.querySelector('[data-act="copy"]');if(!x)return;let v=d();x.textContent="Copy Prompt",x.disabled=!v,x.classList.toggle("is-ready",v)}function d(){let w=i?.querySelector(".panel-editor");if(!w)return!1;if(w.querySelector(".tag"))return!0;return(w.textContent??"").trim().length>0}function l(){if(!s){s=document.createElement("div"),s.className="dock-wrap",s.innerHTML=`
        <button class="dock-icon" title="启用 DOM Snapshot">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5h12M3 9h12M3 13.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="13.5" cy="13.5" r="2.2" stroke="currentColor" stroke-width="1.4"/>
          </svg>
        </button>
      `,p.appendChild(s);let w=s.querySelector(".dock-icon");Yr(w),requestAnimationFrame(()=>Qr(w,tr())),w.addEventListener("click",()=>{U(!1),M(!0)})}}function Y(){let w=p.querySelector(".toast");if(w)w.remove();if(!n)return;let x=document.createElement("div");x.className=`toast ${n.kind==="error"?"toast-error":""}`,x.innerHTML=n.kind==="success"?`<svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${W(n.text)}`:W(n.text),p.appendChild(x)}let D=q(b),B=dr((w)=>{if(w.type==="chip-insert-request"&&f){let x=k().items.find((v)=>v.id===w.id);if(x)f.insertChip(x);y(k().items.filter((v)=>v.committed).length)}else if(w.type==="editor-clear"&&f)f.clearAll(),y(0);else if(w.type==="copy-request"&&f){let x=f.serialize(),v=T(x,k().items);navigator.clipboard.writeText(v).then(()=>g("success","已复制到剪贴板"),()=>g("error","复制失败"))}});return()=>{D(),B(),window.clearTimeout(a),f?.unmount(),f=null,p.remove()}}class qr{host;chipMap=new Map;savedRange=null;selectionHandler=null;constructor(r){this.host=r}getSelection(){let r=this.host.getRootNode();if(r instanceof ShadowRoot){let o=r.getSelection;if(typeof o==="function"){let p=o.call(r);if(p)return p}}return this.host.ownerDocument.getSelection()}mount(){let r=this.host.ownerDocument;this.selectionHandler=()=>{let o=this.getSelection();if(!o||o.rangeCount===0)return;let p=o.getRangeAt(0);if(this.host.contains(p.startContainer))this.savedRange=p.cloneRange()},r.addEventListener("selectionchange",this.selectionHandler),this.host.addEventListener("click",(o)=>{let p=o.target,n=p.closest(".tag-x");if(n){o.preventDefault();let s=n.closest(".tag")?.dataset.dsaiId;if(s)this.removeChip(s);return}let f=p.closest(".tag")?.dataset.dsaiId;if(!f)return;o.preventDefault(),Q(f),Z(f)?.scrollIntoView({block:"center",inline:"nearest"})}),this.host.addEventListener("input",()=>this.reconcileFromDom()),this.host.addEventListener("mouseenter",(o)=>{let p=o.target?.closest?.(".tag");if(!(p instanceof HTMLElement))return;let n=p.querySelector(".tag-tooltip");if(!n)return;let a=140;if(p.getBoundingClientRect().top<a)n.classList.add("tooltip-below");else n.classList.remove("tooltip-below")},!0)}unmount(){if(this.selectionHandler)this.host.ownerDocument.removeEventListener("selectionchange",this.selectionHandler),this.selectionHandler=null;this.chipMap.clear(),this.savedRange=null}insertChip(r){if(this.chipMap.has(r.id))return;let o=mr(r),p=this.resolveInsertionRange();p.collapse(!1),p.insertNode(o);let n=this.host.ownerDocument.createTextNode(" ");o.parentNode.insertBefore(n,o.nextSibling),this.host.focus();let a=this.getSelection();if(a){let f=this.host.ownerDocument.createRange();f.setStartAfter(n),f.collapse(!0),a.removeAllRanges(),a.addRange(f),this.savedRange=f.cloneRange()}this.chipMap.set(r.id,o)}removeChip(r){let o=this.chipMap.get(r);if(!o)return;o.remove(),this.chipMap.delete(r),H(r)}clearAll(){this.chipMap.clear(),this.savedRange=null,this.host.replaceChildren()}patchChip(r){let o=this.chipMap.get(r.id);if(!o)return;o.replaceChildren(...Gr(r))}syncFromStore(r){let o=new Map(r.map((p)=>[p.id,p]));for(let[p,n]of this.chipMap){let a=o.get(p);if(a&&a.committed)this.patchChip(a);else n.remove(),this.chipMap.delete(p)}}serialize(){let r=[],o=!1;return this.host.childNodes.forEach((p)=>{if(p.nodeType===Node.TEXT_NODE){let n=p.textContent??"";if(o&&n.length>0&&(n[0]===" "||n[0]===" "))n=n.slice(1);if(o=!1,n=n.replaceAll(" "," "),n)r.push({kind:"text",value:n});return}if(p instanceof HTMLElement){if(p.tagName==="BR"){r.push({kind:"text",value:`
`}),o=!1;return}if(p.classList.contains("tag")&&p.dataset.dsaiId){r.push({kind:"chip",id:p.dataset.dsaiId}),o=!0;return}let n=p.textContent??"";if(n)r.push({kind:"text",value:n});o=!1}}),r}resolveInsertionRange(){let r=this.host.ownerDocument,o=this.getSelection();if(o&&o.rangeCount>0){let n=o.getRangeAt(0);if(this.host.contains(n.startContainer))return n}if(this.savedRange&&this.host.contains(this.savedRange.startContainer))return this.savedRange.cloneRange();let p=r.createRange();return p.selectNodeContents(this.host),p.collapse(!1),p}reconcileFromDom(){let r=new Set;this.host.querySelectorAll(".tag[data-dsai-id]").forEach((o)=>{if(o.dataset.dsaiId)r.add(o.dataset.dsaiId)});for(let o of[...this.chipMap.keys()])if(!r.has(o))this.chipMap.delete(o),H(o)}}function mr(r){let o=document.createElement("span");return o.className="tag",o.contentEditable="false",o.dataset.dsaiId=r.id,o.title=r.selector,o.replaceChildren(...Gr(r)),o}function Gr(r){let o=document.createDocumentFragment();if(o.appendChild(document.createTextNode(r.label)),r.styles.length>0){let n=document.createElement("span");n.className="tag-meta",n.title=`Style 已勾选 ${r.styles.length} 个属性`,n.innerHTML=`<svg viewBox="0 0 8 8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M1 2.5h6M1 4.5h6M1 6.5h4"/></svg>${r.styles.length}`,o.appendChild(n)}if(r.htmlAttached){let n=document.createElement("span");n.className="tag-meta",n.title=`HTML ${r.htmlMode}`,n.textContent=r.htmlMode==="simplified"?"HTML·S":"HTML·F",o.appendChild(n)}let p=document.createElement("button");return p.className="tag-x",p.title="Remove",p.innerHTML='<svg viewBox="0 0 8 8"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" stroke-width="1.4"/><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" stroke-width="1.4"/></svg>',o.appendChild(p),o.appendChild(Er(r)),[...o.childNodes]}function Er(r){let o=document.createElement("span");o.className="tag-tooltip";let p=r.styles.length?`<span class="tt-val">${oo(r.styles)}</span>`:'<span class="tt-val tt-empty">未勾选任何属性</span>',n=r.htmlAttached?`<span class="tt-val">${r.htmlMode} · ${r.htmlSnap.lineCount} 行 · ${r.htmlSnap.charCount}B</span>`:'<span class="tt-val tt-empty">未附加 HTML</span>',a=r.note.trim()?`<span class="tt-val">${W(r.note.trim()).slice(0,60)}</span>`:'<span class="tt-val tt-empty">无修改意见</span>';return o.innerHTML=`
    <div class="tt-row"><span class="tt-key">Selector</span><span class="tt-val">${W(r.selector)}</span></div>
    <div class="tt-row"><span class="tt-key">Styles</span>${p}</div>
    <div class="tt-row"><span class="tt-key">HTML</span>${n}</div>
    <div class="tt-row"><span class="tt-key">Edit</span>${a}</div>
  `,o}var er={layout:"Layout",text:"Text",bg:"Bg",border:"Border",effects:"Effects",other:"Other"},ro=["layout","text","bg","border","effects","other"];function oo(r){let o={};for(let p of r){let n=ir(p.k);o[n]=(o[n]??0)+1}return ro.filter((p)=>o[p]).map((p)=>`<span class="tt-pill">${er[p]} ${o[p]}</span>`).join("")}function W(r){return r.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}var j={popcard:null,activeStyleGroup:"layout"},_=32,J=8;function Wr(r){let o=document.createElement("div");o.setAttribute("data-dsai-toolbar",""),r.appendChild(o);let p=null,n=0,a=()=>{if(n)return;n=requestAnimationFrame(()=>{n=0,po(o,f)})},f={get:()=>p,set:(g)=>{p=g}},i=null,s=q((g)=>{if(g.activeId!==i)j.popcard=null,i=g.activeId;a()});return window.addEventListener("scroll",a,!0),window.addEventListener("resize",a),()=>{if(s(),window.removeEventListener("scroll",a,!0),window.removeEventListener("resize",a),n)cancelAnimationFrame(n);n=0,o.remove(),p=null,j.popcard=null}}function po(r,o){let p=k(),n=p.activeId,a=n?p.items.find((y)=>y.id===n)??null:null,f=n?Z(n):null;if(!p.enabled||!n||!a||!f||!f.isConnected){r.replaceChildren(),o.set(null);return}let i=f.getBoundingClientRect(),s=i.top>=_+J+4,g=o.get();if(!g||g.itemId!==n){r.replaceChildren();let y=xo(a);r.appendChild(y),g={itemId:n,toolbarEl:y,cardEl:null,cardKind:null,cardHeight:0},o.set(g)}else fo(g.toolbarEl,a);let h=j.popcard;if(g.cardKind!==h){if(g.cardEl)g.cardEl.remove();if(h){let y=Fr(h,a);r.appendChild(y),g.cardEl=y,g.cardHeight=y.offsetHeight,g.cardKind=h}else g.cardEl=null,g.cardKind=null,g.cardHeight=0}else if(g.cardEl&&h)io(g.cardEl,h,a),g.cardHeight=g.cardEl.offsetHeight;if(no(g.toolbarEl,i,s),g.cardEl){let y=h==="style"?480:320;ao(g.cardEl,i,y,s,g.cardHeight),bo(g.cardEl,g.toolbarEl,h)}}function no(r,o,p){let n=p?o.top-(_+J):o.bottom+J,a=Math.max(8,o.left-2);r.style.top=`${n}px`,r.style.left=`${a}px`}function ao(r,o,p,n,a){let f=o.left,i=f+p-window.innerWidth+12;if(i>0)f-=i;r.style.left=`${Math.max(8,f)}px`;let s=n?0:_+J,g=n?_+J:0,b=o.bottom+J+s,h=o.top-J-g-a;if(b+a+8<=window.innerHeight||h<8)r.classList.remove("arrow-bottom"),r.style.top=`${Math.min(window.innerHeight-a-8,b)}px`;else r.classList.add("arrow-bottom"),r.style.top=`${Math.max(8,h)}px`}function xo(r){let o=document.createElement("div");return o.className="toolbar",Vr(o,r),o.addEventListener("click",(p)=>{let n=p.target?.closest(".tb-btn");if(!n||!o.contains(n))return;p.stopPropagation();let a=n.dataset.act;if(a==="attach"){if(r.committed)ur(r.id);else vr(r.id),G({type:"chip-insert-request",id:r.id});return}j.popcard=j.popcard===a?null:a,Q(r.id)}),o.addEventListener("mousedown",(p)=>{if(p.target?.closest?.(".tb-btn"))p.preventDefault()}),o}function fo(r,o){Vr(r,o)}function Vr(r,o){let p=o.committed,n=o.styles.length,a=O(o.id).reduce((f,i)=>f+i.props.length,0);r.innerHTML=`
    <span class="tb-selector" title="${K(o.selector)}">
      <span class="sel-dot${p?" attached":""}"></span>${z(o.label)}
    </span>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-btn-icon${j.popcard==="edit"?" is-active":""}${o.note.trim()?" has-note":""}" data-act="edit" title="Edit">
      <svg viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-7 7H3.5v-3l7-7zM9 4l3 3"/></svg>
    </button>
    <button class="tb-btn${j.popcard==="style"?" is-active":""}${n>0?" has-note":""}" data-act="style">
      Style <span class="tb-sub">${n}/${a}</span>
    </button>
    <button class="tb-btn${j.popcard==="html"?" is-active":""}${o.htmlAttached?" has-note":""}" data-act="html">
      HTML <span class="tb-sub">${o.htmlMode==="simplified"?"Simplified":"Full"}</span>
    </button>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-attach${p?" is-done":""}" data-act="attach">${p?"✓ Attached":"+ Attach"}</button>
  `}function Fr(r,o){if(r==="edit")return go(o);if(r==="style")return ho(o);return so(o)}function io(r,o,p){let n=Fr(o,p);r.replaceChildren(...Array.from(n.childNodes)),r.className=n.className}function bo(r,o,p){let n=o.querySelector(`[data-act="${p}"]`);if(!n)return;let a=n.getBoundingClientRect(),f=r.getBoundingClientRect(),i=Math.max(16,Math.min(f.width-28,a.left+a.width/2-f.left-6));r.style.setProperty("--arrow-x",`${i}px`)}function go(r){let o=document.createElement("div");o.className="popcard from-edit",o.innerHTML=`
    <div class="popcard-header">
      <span class="popcard-title">Modification</span>
      <span class="popcard-meta" title="${K(r.selector)}">${z(r.label)}</span>
    </div>
    <div class="edit-body">
      <textarea placeholder="描述你想对这个元素做的改动…">${z(r.note)}</textarea>
    </div>
    <div class="edit-actions">
      <button class="ghost" data-act="cancel">Cancel</button>
      <button class="primary" data-act="save">Save</button>
    </div>
  `;let p=o.querySelector("textarea");return o.querySelector('[data-act="cancel"]').addEventListener("click",()=>{j.popcard=null,Q(r.id)}),o.querySelector('[data-act="save"]').addEventListener("click",()=>{cr(r.id,p.value),j.popcard=null,Q(r.id)}),o}function ho(r){let o=O(r.id),p=j.activeStyleGroup,n=o.find((b)=>b.id===p)??o[0],a=new Map(r.styles.map((b)=>[b.k,b])),f=o.reduce((b,h)=>b+h.props.length,0),i=f>0&&r.styles.length===f,s=document.createElement("div");s.className="popcard from-style",s.innerHTML=`
    <div class="popcard-header">
      <span class="popcard-title">Computed Styles</span>
      <span class="popcard-meta">${r.styles.length} selected</span>
    </div>
    <div class="style-split">
      <div class="style-groups">
        ${o.map((b)=>{let h=b.props.filter((l)=>a.has(l.k)).length,y=h>0?" has-selection":"";return`<div class="style-group${b.id===n.id?" is-active":""}${y}" data-group="${b.id}">
            <span class="sg-name">${b.title}</span>
            <span class="sg-count">${h}/${b.props.length}</span>
          </div>`}).join("")}
      </div>
      <div class="style-props">
        <div class="style-props-head">
          <span class="sp-title">${n.title} · ${n.props.length} properties</span>
          <button class="sp-toggle">${n.props.every((b)=>a.has(b.k))&&n.props.length?"Clear all":"Select all"}</button>
        </div>
        <div class="prop-chips">
          ${n.props.map((b)=>{let h=a.has(b.k);return`<label class="prop-chip${h?" is-on":""}">
              <input type="checkbox" data-key="${K(b.k)}"${h?" checked":""}>
              ${b.swatch?`<span class="prop-swatch" style="background:${K(b.swatch)}"></span>`:""}
              <span class="prop-key">${z(b.k)}</span>
              <span class="prop-val">${z(b.v)}</span>
            </label>`}).join("")}
        </div>
      </div>
    </div>
    <div class="style-footer">
      <label class="all-toggle">
        <input type="checkbox" data-act="all"${i?" checked":""}>
        All non-default styles
      </label>
      <span class="footer-meta">${r.styles.length} / ${f} attached</span>
      <button class="add-btn" data-act="done">Done</button>
    </div>
  `;let g=new Map(o.flatMap((b)=>b.props.map((h)=>[h.k,h])));return s.querySelectorAll(".style-group").forEach((b)=>{b.addEventListener("click",()=>{j.activeStyleGroup=b.dataset.group,Q(r.id)})}),s.querySelectorAll(".prop-chip input").forEach((b)=>{b.addEventListener("change",()=>{let h=b.dataset.key,y=[...a.values()],d=b.checked?[...y,g.get(h)].filter((l)=>!!l):y.filter((l)=>l.k!==h);R(r.id,d)})}),s.querySelector(".sp-toggle").addEventListener("click",()=>{let b=n.props.every((d)=>a.has(d.k))&&n.props.length>0,h=r.styles.filter((d)=>!n.props.some((l)=>l.k===d.k)),y=b?h:[...h,...n.props];R(r.id,y)}),s.querySelector('[data-act="all"]').addEventListener("change",(b)=>{let y=b.currentTarget.checked?o.flatMap((d)=>d.props):[];R(r.id,y)}),s.querySelector('[data-act="done"]').addEventListener("click",()=>{j.popcard=null,Q(r.id)}),s}function so(r){let o=document.createElement("div");return o.className="popcard from-html",o.innerHTML=`
    <div class="popcard-header">
      <span class="popcard-title">HTML Snapshot</span>
      <span class="popcard-meta" title="${K(r.selector)}">${z(r.label)}</span>
    </div>
    <p class="html-hint">选择把哪种 HTML 形式附加到 prompt。</p>
    <div class="html-tabs">
      <button class="html-tab${r.htmlMode==="simplified"?" is-on":""}" data-mode="simplified">
        <span class="ht-label">Simplified</span>
        <span class="ht-desc">仅自身节点 · 不含子元素</span>
      </button>
      <button class="html-tab${r.htmlMode==="full"?" is-on":""}" data-mode="full">
        <span class="ht-label">Full</span>
        <span class="ht-desc">含所有后代 · 文本截 100 字</span>
      </button>
    </div>
    <div class="html-code-wrap">
      <pre class="html-code">${vo(r.htmlSnap.html)}</pre>
    </div>
    <div class="html-footer">
      <span class="html-meta">${r.htmlSnap.lineCount} 行 · ${r.htmlSnap.charCount} 字符</span>
      <button class="html-attach${r.htmlAttached?" is-attached":""}" data-act="toggle">${r.htmlAttached?"Detach":"Attach to prompt"}</button>
    </div>
  `,o.querySelectorAll(".html-tab").forEach((p)=>{p.addEventListener("click",()=>{let n=p.dataset.mode;yr(r.id,n)})}),o.querySelector('[data-act="toggle"]').addEventListener("click",()=>{wr(r.id,!r.htmlAttached)}),o}function z(r){return r.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function K(r){return z(r)}function vo(r){let o=/<\/?[A-Za-z][^>]*>/g,p="",n=0,a;while(a=o.exec(r)){if(a.index>n)p+=z(r.slice(n,a.index));p+=uo(a[0]),n=a.index+a[0].length}if(n<r.length)p+=z(r.slice(n));return p}function uo(r){let o=/^<(\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(r);if(!o)return z(r);let[,p,n,a,f]=o,i=yo(a);return`<span class="html-punct">&lt;${p}</span><span class="html-tag">${z(n)}</span>`+i+`<span class="html-punct">${f?"/":""}&gt;</span>`}function yo(r){let o=/(\s+)([A-Za-z_:][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`<>=]+)?/g,p="",n=0,a;while(a=o.exec(r)){if(a.index>n)p+=z(r.slice(n,a.index));let[,f,i,s,g]=a;if(p+=z(f),p+=`<span class="html-attr">${z(i)}</span>`,s&&g!==void 0){p+=z(s);let b=/^["']/.test(g);p+=b?`<span class="html-str">${z(g)}</span>`:`<span class="html-val">${z(g)}</span>`}else if(s)p+=z(s);n=a.index+a[0].length}if(n<r.length)p+=z(r.slice(n));return p}var N="__dom_snapshot_ai_root__",E="data-dsai-hover",e="data-dsai-selected",rr="__dom_snapshot_ai_outline_style__",wo=`
html.__dsai_active__, html.__dsai_active__ * { cursor: crosshair !important; }
[${E}] {
  outline: 1.5px dashed #0066cc !important;
  outline-offset: 2px !important;
  background-color: rgba(0, 102, 204, 0.045) !important;
}
[${e}] {
  outline: 2px solid #0066cc !important;
  outline-offset: 3px !important;
  background-color: rgba(0, 102, 204, 0.055) !important;
}
`,Ur=["mousedown","mouseup","click","contextmenu","dblclick","auxclick"],Mr=["pointerdown"];function Nr(r){co();let o=null,p=null,n=!1,a=!1,f=(x)=>{if(o===x)return;if(o)o.removeAttribute(E);if(o=x,x)x.setAttribute(E,"")},i=(x)=>{if(p===x)return;if(p)p.removeAttribute(e);if(p=x,x)x.setAttribute(e,"")},s=()=>{let{activeId:x,enabled:v}=k(),c=x&&v?Z(x)??null:null;i(c)},g=(x)=>{if(Kr(x)){f(null);return}let v=m(x.clientX,x.clientY);if(!v||v===p){f(null);return}f(v)},b=()=>{let c=document.getElementById(N)?.shadowRoot?.activeElement;if(c&&typeof c.blur==="function")c.blur()},h=(x)=>{if(Kr(x))return;if(x.type==="pointerdown"){if(!m(x.clientX,x.clientY))return;x.stopImmediatePropagation();return}if(x.preventDefault(),x.stopImmediatePropagation(),x.type==="mousedown")b();if(x.type!=="click")return;let v=m(x.clientX,x.clientY);if(!v)return;let c=A(v,x.shiftKey);if(f(null),r.onSelect(v,c),x.shiftKey)G({type:"chip-insert-request",id:c})},y=(x)=>{let v=x.ctrlKey||x.metaKey||x.altKey,c=d(x.target);if(x.key==="Escape"&&!v){x.preventDefault(),L(),G({type:"editor-clear"}),f(null),i(null),b();return}if((x.altKey||x.metaKey)&&x.key.toLowerCase()==="c"){x.preventDefault(),G({type:"copy-request"});return}if(c)return;if(x.code==="Space"&&!v){x.preventDefault(),M(!k().enabled);return}if(x.key==="ArrowUp"||x.key==="ArrowDown"||x.key==="ArrowLeft"||x.key==="ArrowRight")l(x)},d=(x)=>{if(!(x instanceof Element))return!1;if(x.closest(`#${N}`))return!0;if(x instanceof HTMLElement&&x.isContentEditable)return!0;let v=x.tagName;return v==="INPUT"||v==="TEXTAREA"||v==="SELECT"},l=(x)=>{if(d(x.target))return;let v=k().activeId;if(!v)return;let c=Z(v);if(!c)return;let X=null;if(x.key==="ArrowUp")X=c.parentElement;else if(x.key==="ArrowDown")X=c.firstElementChild;else if(x.key==="ArrowLeft")X=c.previousElementSibling;else if(x.key==="ArrowRight")X=c.nextElementSibling;if(!X||X===document.body||X===document.documentElement)return;x.preventDefault(),A(X,!1)},Y=()=>{for(let x of Ur)window.addEventListener(x,h,{capture:!0,passive:!1});for(let x of Mr)window.addEventListener(x,h,{capture:!0,passive:!1});window.addEventListener("mousemove",g,!0),window.addEventListener("pointermove",g,!0)},D=()=>{for(let x of Ur)window.removeEventListener(x,h,{capture:!0});for(let x of Mr)window.removeEventListener(x,h,{capture:!0});window.removeEventListener("mousemove",g,!0),window.removeEventListener("pointermove",g,!0),f(null)},B=()=>{let{enabled:x}=k();if(document.documentElement.classList.toggle("__dsai_active__",x),x&&!n)Y(),n=!0;else if(!x&&n)D(),n=!1};document.addEventListener("keydown",y,!0);let w=q(()=>{B(),s()});return B(),()=>{if(a)return;if(a=!0,n)D(),n=!1;document.removeEventListener("keydown",y,!0),w(),f(null),i(null),document.documentElement.classList.remove("__dsai_active__"),zo(),U(!1)}}function co(){if(document.getElementById(rr))return;let r=document.createElement("style");r.id=rr,r.textContent=wo,document.head.appendChild(r)}function zo(){document.getElementById(rr)?.remove()}function m(r,o){let p=document.elementsFromPoint(r,o);for(let n of p){if(n.id===N)continue;if(n.closest(`#${N}`))continue;if(n.hasAttribute("data-dsai-toolbar"))continue;if(n===document.documentElement||n===document.body)continue;return n}return null}function Kr(r){let o=r.composedPath();for(let p of o)if(p instanceof Element&&p.id===N)return!0;return!1}var Dr="__dom_snapshot_ai_root__";function lo(){if(document.getElementById(Dr))return;let r=document.createElement("div");r.id=Dr,document.body.appendChild(r);let o=r.attachShadow({mode:"open"}),p=document.createElement("style");p.textContent=or,o.appendChild(p);let n=()=>{},a=Jr(o,()=>n()),f=Wr(o),i=Nr({onSelect:()=>{}});n=()=>{i(),f(),a(),L(),r.remove()}}lo();})();
