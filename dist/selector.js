(() => {
  // src/styles.css
  var styles_default = `:host, * { box-sizing: border-box; }

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

/* Dock hint bubble */
.dock-wrap { display: contents; }
.dock-hint {
  position: fixed; right: 58px; top: 50%;
  transform: translateY(-50%);
  background: var(--ink); color: #fff;
  font-size: 11.5px; letter-spacing: -0.08px;
  padding: 6px 10px; border-radius: 6px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity 140ms;
  z-index: 2147483647;
}
.dock-hint::after {
  content: ""; position: absolute;
  right: -4px; top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 8px; height: 8px; background: var(--ink);
}
.dock-icon:hover ~ .dock-hint { opacity: 0.92; }

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
.copy-btn.is-ready { background: var(--surface-chip); color: var(--ink); }
.copy-btn.is-ready:hover { background: var(--primary); color: #fff; }
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
.dock-badge {
  position: absolute; top: -4px; left: -4px;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--primary); color: #fff;
  border-radius: 9999px;
  font-size: 10px; font-weight: 600; line-height: 16px;
  text-align: center; box-shadow: 0 0 0 2px var(--canvas);
}

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
`;

  // src/core/selector-path.ts
  function selectorFor(el) {
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
      parts.unshift(segmentFor(cur));
      if (cur.id)
        break;
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }
  function shortLabelFor(el) {
    return segmentFor(el);
  }
  function segmentFor(el) {
    const tag = el.tagName.toLowerCase();
    if (el.id)
      return `${tag}#${cssEscape(el.id)}`;
    const classes = Array.from(el.classList).filter((c) => !/^[0-9]/.test(c) && c.length < 32).slice(0, 2).map(cssEscape);
    if (classes.length)
      return `${tag}.${classes.join(".")}`;
    const parent = el.parentElement;
    if (!parent)
      return tag;
    const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
    if (sameTag.length === 1)
      return tag;
    const idx = sameTag.indexOf(el) + 1;
    return `${tag}:nth-of-type(${idx})`;
  }
  function cssEscape(s) {
    if (typeof CSS !== "undefined" && CSS.escape)
      return CSS.escape(s);
    return s.replace(/([^\w-])/g, "\\$1");
  }

  // src/core/style-groups.ts
  var GROUP_PROPS = {
    layout: [
      "display",
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "width",
      "height",
      "min-width",
      "min-height",
      "max-width",
      "max-height",
      "margin",
      "padding",
      "flex-direction",
      "flex-wrap",
      "flex",
      "gap",
      "justify-content",
      "align-items",
      "align-self",
      "grid-template-columns",
      "grid-template-rows",
      "grid-column",
      "grid-row",
      "box-sizing"
    ],
    text: [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "letter-spacing",
      "text-align",
      "text-decoration",
      "text-transform",
      "color",
      "white-space",
      "word-break"
    ],
    bg: [
      "background-color",
      "background-image",
      "background-size",
      "background-position",
      "background-repeat",
      "background-attachment"
    ],
    border: [
      "border",
      "border-width",
      "border-style",
      "border-color",
      "border-top",
      "border-right",
      "border-bottom",
      "border-left",
      "border-radius",
      "outline",
      "outline-offset"
    ],
    effects: [
      "opacity",
      "transform",
      "transition",
      "animation",
      "box-shadow",
      "filter",
      "backdrop-filter",
      "mix-blend-mode"
    ],
    other: [
      "cursor",
      "z-index",
      "overflow",
      "overflow-x",
      "overflow-y",
      "pointer-events",
      "visibility",
      "user-select"
    ]
  };
  var DEFAULTS = new Set([
    "none",
    "auto",
    "normal",
    "visible",
    "0px",
    "0",
    "0% 0%",
    "rgba(0, 0, 0, 0)",
    "transparent",
    "repeat",
    "scroll",
    "static",
    "currentcolor",
    "baseline",
    "stretch",
    "flex-start"
  ]);
  function collectStyles(el) {
    const cs = getComputedStyle(el);
    return Object.keys(GROUP_PROPS).map((id) => ({
      id,
      title: titleOf(id),
      props: GROUP_PROPS[id].map((k) => {
        const v = cs.getPropertyValue(k).trim();
        if (!v || DEFAULTS.has(v))
          return null;
        const prop = { k, v };
        const sw = swatchOf(v);
        if (sw)
          prop.swatch = sw;
        return prop;
      }).filter((p) => p !== null)
    }));
  }
  function titleOf(id) {
    return id === "bg" ? "Background" : id[0].toUpperCase() + id.slice(1);
  }
  function swatchOf(v) {
    if (/^#[0-9a-f]{3,8}$/i.test(v))
      return v;
    if (/^rgba?\(/.test(v) && !v.includes(", 0)"))
      return v;
    return;
  }

  // src/core/html-snapshot.ts
  var TEXT_LIMIT = 100;
  var VOID_TAGS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  function htmlSnapshot(el, mode = "simplified") {
    const html = mode === "simplified" ? buildSimplified(el) : buildFull(el);
    return {
      html,
      lineCount: html.split(`
`).length,
      charCount: html.length
    };
  }
  function buildSimplified(el) {
    const tag = el.tagName.toLowerCase();
    const attrs = renderAttrs(el);
    if (VOID_TAGS.has(tag))
      return `<${tag}${attrs}>`;
    return `<${tag}${attrs}></${tag}>`;
  }
  function buildFull(el) {
    return serialize(el, 0);
  }
  function serialize(node, depth) {
    const indent = "  ".repeat(depth);
    if (node.nodeType === 3) {
      const t = collapseWs(node.textContent ?? "");
      return t ? indent + truncate(t) : "";
    }
    if (node.nodeType !== 1)
      return "";
    const el = node;
    const tag = el.tagName.toLowerCase();
    const attrs = renderAttrs(el);
    if (VOID_TAGS.has(tag))
      return `${indent}<${tag}${attrs}>`;
    const meaningful = Array.from(el.childNodes).filter((c) => {
      if (c.nodeType !== 3)
        return true;
      return collapseWs(c.textContent ?? "").length > 0;
    });
    if (meaningful.length === 0) {
      return `${indent}<${tag}${attrs}></${tag}>`;
    }
    if (meaningful.every((c) => c.nodeType === 3)) {
      const text = meaningful.map((c) => collapseWs(c.textContent ?? "")).join(" ");
      return `${indent}<${tag}${attrs}>${truncate(text)}</${tag}>`;
    }
    const childOut = meaningful.map((c) => serialize(c, depth + 1)).filter(Boolean).join(`
`);
    return `${indent}<${tag}${attrs}>
${childOut}
${indent}</${tag}>`;
  }
  function renderAttrs(el) {
    return Array.from(el.attributes).map((a) => ` ${a.name}="${a.value}"`).join("");
  }
  function collapseWs(s) {
    return s.replace(/\s+/g, " ").trim();
  }
  function truncate(s) {
    return s.length > TEXT_LIMIT ? s.slice(0, TEXT_LIMIT) + "…" : s;
  }

  // src/core/store.ts
  var state = {
    items: [],
    panelCollapsed: false,
    panelOpen: true,
    activeId: null,
    enabled: true
  };
  var elementById = new Map;
  var styleCache = new Map;
  var listeners = new Set;
  var seq = 0;
  function notify() {
    listeners.forEach((l) => l(state));
  }
  function subscribe(l) {
    listeners.add(l);
    l(state);
    return () => listeners.delete(l);
  }
  function getState() {
    return state;
  }
  function getElement(id) {
    return elementById.get(id);
  }
  function getStyleGroups(id) {
    const cached = styleCache.get(id);
    if (cached)
      return cached;
    const el = elementById.get(id);
    if (!el)
      return [];
    const groups = collectStyles(el);
    styleCache.set(id, groups);
    return groups;
  }
  function addElement(el, commit = false) {
    for (const [id2, existing] of elementById) {
      if (existing === el) {
        state.activeId = id2;
        if (commit) {
          state.items = state.items.map((it) => it.id === id2 ? { ...it, committed: true } : it);
        }
        notify();
        return id2;
      }
    }
    state.items.filter((it) => !it.committed).forEach((it) => {
      elementById.delete(it.id);
      styleCache.delete(it.id);
    });
    state.items = state.items.filter((it) => it.committed);
    const id = `sel_${++seq}`;
    elementById.set(id, el);
    const snap = htmlSnapshot(el, "simplified");
    state.items = [
      ...state.items,
      {
        id,
        selector: selectorFor(el),
        label: shortLabelFor(el),
        styles: [],
        htmlMode: "simplified",
        htmlSnap: snap,
        htmlAttached: true,
        committed: commit,
        note: ""
      }
    ];
    state.activeId = id;
    notify();
    return id;
  }
  function commitItem(id) {
    state.items = state.items.map((it) => it.id === id ? { ...it, committed: true } : it);
    notify();
  }
  function uncommitItem(id) {
    state.items = state.items.map((it) => it.id === id ? { ...it, committed: false } : it);
    notify();
  }
  function removeItem(id) {
    elementById.delete(id);
    styleCache.delete(id);
    state.items = state.items.filter((it) => it.id !== id);
    if (state.activeId === id)
      state.activeId = null;
    notify();
  }
  function setActive(id) {
    state.activeId = id;
    notify();
  }
  function updateStyles(id, styles) {
    state.items = state.items.map((it) => it.id === id ? { ...it, styles } : it);
    notify();
  }
  function updateHtmlMode(id, mode) {
    const el = elementById.get(id);
    if (!el)
      return;
    const htmlSnap = htmlSnapshot(el, mode);
    state.items = state.items.map((it) => it.id === id ? { ...it, htmlMode: mode, htmlSnap } : it);
    notify();
  }
  function setHtmlAttached(id, attached) {
    state.items = state.items.map((it) => it.id === id ? { ...it, htmlAttached: attached } : it);
    notify();
  }
  function updateNote(id, note) {
    state.items = state.items.map((it) => it.id === id ? { ...it, note } : it);
    notify();
  }
  function setPanelCollapsed(v) {
    state.panelCollapsed = v;
    notify();
  }
  function setPanelOpen(v) {
    state.panelOpen = v;
    notify();
  }
  function setEnabled(next) {
    if (state.enabled === next)
      return;
    state.enabled = next;
    notify();
  }
  function clearAll() {
    elementById.clear();
    styleCache.clear();
    state.items = [];
    state.activeId = null;
    notify();
  }
  var busListeners = new Set;
  function emit(e) {
    busListeners.forEach((l) => l(e));
  }
  function onBus(cb) {
    busListeners.add(cb);
    return () => busListeners.delete(cb);
  }

  // src/core/markdown.ts
  function buildMarkdown(segments, items) {
    const byId = new Map(items.map((it) => [it.id, it]));
    let out = "";
    let previousWasBlock = false;
    for (const seg of segments) {
      if (seg.kind === "text") {
        out += previousWasBlock && seg.value && !seg.value.startsWith(`
`) ? `
${seg.value}` : seg.value;
        previousWasBlock = false;
        continue;
      }
      const item = byId.get(seg.id);
      if (!item)
        continue;
      const block = renderElementBlock(item);
      out += out.endsWith(`
`) || out === "" ? block : `
${block}`;
      previousWasBlock = true;
    }
    return out;
  }
  function renderElementBlock(item) {
    const lines = [];
    lines.push(`# Element: ${item.selector}`);
    lines.push(`- **URL**: ${currentUrlPath()}`);
    lines.push("");
    lines.push(`- **selector**: ${item.selector}`);
    lines.push("");
    if (item.note.trim()) {
      lines.push("- **Modification Request**:");
      lines.push("```text");
      lines.push(item.note.trim());
      lines.push("```");
      lines.push("");
    }
    if (item.styles.length) {
      lines.push("- **Computed Styles**:");
      lines.push("```css");
      item.styles.forEach((p) => lines.push(`${p.k}: ${p.v};`));
      lines.push("```");
      lines.push("");
    }
    if (item.htmlAttached) {
      lines.push(`- **HTML (${item.htmlMode})**:`);
      lines.push("```html");
      lines.push(item.htmlSnap.html);
      lines.push("```");
    }
    return lines.join(`
`);
  }
  function currentUrlPath() {
    try {
      return typeof location !== "undefined" ? location.pathname : "/";
    } catch {
      return "/";
    }
  }

  // src/ui/panel.ts
  var SHORTCUTS = [
    ["Click", "Select"],
    ["⇧", "Multi"],
    ["←↑↓→", "Navigate"],
    ["Space", "Pause"],
    ["⌘C", "Copy"],
    ["⌘Z", "Undo"],
    ["Esc", "Clear"]
  ];
  function renderPanel(root) {
    const layer = document.createElement("div");
    root.appendChild(layer);
    let toastState = null;
    let toastTimer = 0;
    let editor = null;
    let chromeEl = null;
    let dockEl = null;
    const showToast = (kind, text) => {
      toastState = { kind, text };
      repaint();
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toastState = null;
        repaint();
      }, 1800);
    };
    const repaint = () => {
      const s = getState();
      if (!s.panelOpen) {
        layer.innerHTML = "";
        chromeEl = null;
        dockEl = null;
        editor?.unmount();
        editor = null;
        return;
      }
      if (s.panelCollapsed) {
        editor?.syncFromStore(s.items);
        if (chromeEl) {
          chromeEl.style.display = "none";
        }
        const count = s.items.filter((it) => it.committed).length;
        renderDock(count);
        renderToast();
        return;
      }
      if (dockEl) {
        dockEl.remove();
        dockEl = null;
      }
      if (!chromeEl)
        renderChrome();
      else
        chromeEl.style.display = "";
      editor?.syncFromStore(s.items);
      updateFooterCount(s.items.filter((it) => it.committed).length);
      renderToast();
    };
    function renderChrome() {
      chromeEl = document.createElement("div");
      chromeEl.className = "panel-root";
      chromeEl.innerHTML = `
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
        ${SHORTCUTS.map(([k, l]) => `<span class="kbd-group"><span class="kbd">${escapeHtml(k)}</span>${escapeHtml(l)}</span>`).join("")}
      </div>
      <div class="panel-editor-wrap">
        <div class="panel-editor" contenteditable="true" data-placeholder="点击页面元素 → toolbar 中 Attach 将 chip 插入当前光标位置…"></div>
      </div>
      <div class="panel-footer">
        <button class="copy-btn" data-act="copy" disabled>Copy Prompt</button>
      </div>
    `;
      layer.appendChild(chromeEl);
      const editorEl = chromeEl.querySelector(".panel-editor");
      editor = new EditorController(editorEl);
      editor.mount();
      chromeEl.querySelector('[data-act="min"]').addEventListener("click", () => {
        setPanelCollapsed(true);
        setEnabled(false);
      });
      chromeEl.querySelector('[data-act="close"]').addEventListener("click", () => {
        setPanelOpen(false);
      });
      chromeEl.querySelector('[data-act="copy"]').addEventListener("click", () => {
        if (!editor)
          return;
        const segments = editor.serialize();
        const md = buildMarkdown(segments, getState().items);
        navigator.clipboard.writeText(md).then(() => showToast("success", "已复制到剪贴板"), () => showToast("error", "复制失败"));
      });
    }
    function updateFooterCount(n) {
      const btn = chromeEl?.querySelector('[data-act="copy"]');
      if (!btn)
        return;
      btn.textContent = n > 0 ? `Copy Prompt · ${n}` : "Copy Prompt";
      btn.disabled = n === 0;
      btn.classList.toggle("is-ready", n > 0);
    }
    function renderDock(count) {
      if (!dockEl) {
        dockEl = document.createElement("div");
        dockEl.className = "dock-wrap";
        dockEl.innerHTML = `
        <button class="dock-icon" title="展开 DOM Snapshot">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5h12M3 9h12M3 13.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="13.5" cy="13.5" r="2.2" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          <span class="dock-badge" data-count>0</span>
        </button>
        <div class="dock-hint">0 个已选 · 点击展开</div>
      `;
        layer.appendChild(dockEl);
        dockEl.querySelector(".dock-icon").addEventListener("click", () => {
          setPanelCollapsed(false);
          setEnabled(true);
        });
      }
      const badge = dockEl.querySelector("[data-count]");
      badge.textContent = String(count);
      const hint = dockEl.querySelector(".dock-hint");
      hint.textContent = `${count} 个已选 · 点击展开`;
    }
    function renderToast() {
      const existing = layer.querySelector(".toast");
      if (existing)
        existing.remove();
      if (!toastState)
        return;
      const t = document.createElement("div");
      t.className = `toast ${toastState.kind === "error" ? "toast-error" : ""}`;
      t.innerHTML = toastState.kind === "success" ? `<svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(toastState.text)}` : escapeHtml(toastState.text);
      layer.appendChild(t);
    }
    subscribe(repaint);
    onBus((e) => {
      if (e.type === "chip-insert-request" && editor) {
        const item = getState().items.find((it) => it.id === e.id);
        if (item)
          editor.insertChip(item);
      }
    });
  }

  class EditorController {
    host;
    chipMap = new Map;
    savedRange = null;
    selectionHandler = null;
    constructor(host) {
      this.host = host;
    }
    getSelection() {
      const root = this.host.getRootNode();
      if (root instanceof ShadowRoot) {
        const shadowSel = root.getSelection;
        if (typeof shadowSel === "function") {
          const s = shadowSel.call(root);
          if (s)
            return s;
        }
      }
      return this.host.ownerDocument.getSelection();
    }
    mount() {
      const doc = this.host.ownerDocument;
      this.selectionHandler = () => {
        const sel = this.getSelection();
        if (!sel || sel.rangeCount === 0)
          return;
        const r = sel.getRangeAt(0);
        if (this.host.contains(r.startContainer)) {
          this.savedRange = r.cloneRange();
        }
      };
      doc.addEventListener("selectionchange", this.selectionHandler);
      this.host.addEventListener("click", (e) => {
        const target = e.target;
        const x = target.closest(".tag-x");
        if (x) {
          e.preventDefault();
          const tag2 = x.closest(".tag");
          const id2 = tag2?.dataset.dsaiId;
          if (id2)
            this.removeChip(id2);
          return;
        }
        const tag = target.closest(".tag");
        const id = tag?.dataset.dsaiId;
        if (!id)
          return;
        e.preventDefault();
        setActive(id);
        getElement(id)?.scrollIntoView({ block: "center", inline: "nearest" });
      });
      this.host.addEventListener("input", () => this.reconcileFromDom());
      this.host.addEventListener("mouseenter", (e) => {
        const tag = e.target?.closest?.(".tag");
        if (!(tag instanceof HTMLElement))
          return;
        const tt = tag.querySelector(".tag-tooltip");
        if (!tt)
          return;
        const chipRect = tag.getBoundingClientRect();
        const hostRect = this.host.getBoundingClientRect();
        const TOOLTIP_H = 120;
        if (chipRect.top - hostRect.top < TOOLTIP_H) {
          tt.classList.add("tooltip-below");
        } else {
          tt.classList.remove("tooltip-below");
        }
      }, true);
    }
    unmount() {
      if (this.selectionHandler) {
        this.host.ownerDocument.removeEventListener("selectionchange", this.selectionHandler);
        this.selectionHandler = null;
      }
      this.chipMap.clear();
      this.savedRange = null;
    }
    insertChip(item) {
      if (this.chipMap.has(item.id))
        return;
      const chip = buildChipNode(item);
      const range = this.resolveInsertionRange();
      range.collapse(false);
      range.insertNode(chip);
      const after = this.host.ownerDocument.createTextNode(" ");
      chip.parentNode.insertBefore(after, chip.nextSibling);
      this.host.focus();
      const sel = this.getSelection();
      if (sel) {
        const r = this.host.ownerDocument.createRange();
        r.setStartAfter(after);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        this.savedRange = r.cloneRange();
      }
      this.chipMap.set(item.id, chip);
    }
    removeChip(id) {
      const chip = this.chipMap.get(id);
      if (!chip)
        return;
      chip.remove();
      this.chipMap.delete(id);
      removeItem(id);
    }
    patchChip(item) {
      const chip = this.chipMap.get(item.id);
      if (!chip)
        return;
      chip.replaceChildren(...buildChipContent(item));
    }
    syncFromStore(items) {
      const byId = new Map(items.map((it) => [it.id, it]));
      for (const [id, chip] of this.chipMap) {
        const item = byId.get(id);
        if (item && item.committed)
          this.patchChip(item);
        else {
          chip.remove();
          this.chipMap.delete(id);
        }
      }
    }
    serialize() {
      const out = [];
      let stripLeading = false;
      this.host.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let v = node.textContent ?? "";
          if (stripLeading && v.length > 0 && (v[0] === " " || v[0] === " ")) {
            v = v.slice(1);
          }
          stripLeading = false;
          v = v.replaceAll(" ", " ");
          if (v)
            out.push({ kind: "text", value: v });
          return;
        }
        if (node instanceof HTMLElement) {
          if (node.tagName === "BR") {
            out.push({ kind: "text", value: `
` });
            stripLeading = false;
            return;
          }
          if (node.classList.contains("tag") && node.dataset.dsaiId) {
            out.push({ kind: "chip", id: node.dataset.dsaiId });
            stripLeading = true;
            return;
          }
          const v = node.textContent ?? "";
          if (v)
            out.push({ kind: "text", value: v });
          stripLeading = false;
        }
      });
      return out;
    }
    resolveInsertionRange() {
      const doc = this.host.ownerDocument;
      const sel = this.getSelection();
      if (sel && sel.rangeCount > 0) {
        const r2 = sel.getRangeAt(0);
        if (this.host.contains(r2.startContainer))
          return r2;
      }
      if (this.savedRange && this.host.contains(this.savedRange.startContainer)) {
        return this.savedRange.cloneRange();
      }
      const r = doc.createRange();
      r.selectNodeContents(this.host);
      r.collapse(false);
      return r;
    }
    reconcileFromDom() {
      const alive = new Set;
      this.host.querySelectorAll(".tag[data-dsai-id]").forEach((el) => {
        if (el.dataset.dsaiId)
          alive.add(el.dataset.dsaiId);
      });
      for (const id of [...this.chipMap.keys()]) {
        if (!alive.has(id)) {
          this.chipMap.delete(id);
          removeItem(id);
        }
      }
    }
  }
  function buildChipNode(item) {
    const span = document.createElement("span");
    span.className = "tag";
    span.contentEditable = "false";
    span.dataset.dsaiId = item.id;
    span.title = item.selector;
    span.replaceChildren(...buildChipContent(item));
    return span;
  }
  function buildChipContent(item) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(item.label));
    if (item.styles.length > 0) {
      const meta = document.createElement("span");
      meta.className = "tag-meta";
      meta.title = `Style 已勾选 ${item.styles.length} 个属性`;
      meta.innerHTML = `<svg viewBox="0 0 8 8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M1 2.5h6M1 4.5h6M1 6.5h4"/></svg>${item.styles.length}`;
      frag.appendChild(meta);
    }
    if (item.htmlAttached) {
      const meta = document.createElement("span");
      meta.className = "tag-meta";
      meta.title = `HTML ${item.htmlMode}`;
      meta.textContent = item.htmlMode === "simplified" ? "HTML·S" : "HTML·F";
      frag.appendChild(meta);
    }
    const x = document.createElement("button");
    x.className = "tag-x";
    x.title = "Remove";
    x.innerHTML = `<svg viewBox="0 0 8 8"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" stroke-width="1.4"/><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" stroke-width="1.4"/></svg>`;
    frag.appendChild(x);
    frag.appendChild(buildTooltip(item));
    return [...frag.childNodes];
  }
  function buildTooltip(item) {
    const tt = document.createElement("span");
    tt.className = "tag-tooltip";
    const styleRow = item.styles.length ? `<span class="tt-val">${item.styles.length} 个属性</span>` : `<span class="tt-val tt-empty">未勾选任何属性</span>`;
    const htmlRow = item.htmlAttached ? `<span class="tt-val">${item.htmlMode} · ${item.htmlSnap.lineCount} 行 · ${item.htmlSnap.charCount}B</span>` : `<span class="tt-val tt-empty">未附加 HTML</span>`;
    const noteRow = item.note.trim() ? `<span class="tt-val">${escapeHtml(item.note.trim()).slice(0, 60)}</span>` : `<span class="tt-val tt-empty">无修改意见</span>`;
    tt.innerHTML = `
    <div class="tt-row"><span class="tt-key">Selector</span><span class="tt-val">${escapeHtml(item.selector)}</span></div>
    <div class="tt-row"><span class="tt-key">Styles</span>${styleRow}</div>
    <div class="tt-row"><span class="tt-key">HTML</span>${htmlRow}</div>
    <div class="tt-row"><span class="tt-key">Edit</span>${noteRow}</div>
  `;
    return tt;
  }
  function escapeHtml(s) {
    return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  // src/ui/toolbar.ts
  var ui = { popcard: null, activeStyleGroup: "layout" };
  var TOOLBAR_H = 32;
  var TOOLBAR_GAP = 8;
  function initToolbar(root) {
    const layer = document.createElement("div");
    layer.setAttribute("data-dsai-toolbar", "");
    root.appendChild(layer);
    let rafId = 0;
    const reposition = () => {
      if (rafId)
        cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => render(layer));
    };
    subscribe((s) => {
      if (!s.activeId)
        ui.popcard = null;
      render(layer);
    });
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
  }
  function render(layer) {
    const s = getState();
    const id = s.activeId;
    const item = id ? s.items.find((it) => it.id === id) ?? null : null;
    const el = id ? getElement(id) : null;
    if (!id || !item || !el || !el.isConnected) {
      layer.innerHTML = "";
      return;
    }
    const rect = el.getBoundingClientRect();
    const placeAbove = rect.top >= TOOLBAR_H + TOOLBAR_GAP + 4;
    layer.innerHTML = "";
    const toolbar = buildToolbar(item, rect, placeAbove);
    layer.appendChild(toolbar);
    if (ui.popcard) {
      const card = buildPopcard(ui.popcard, item, rect, placeAbove, toolbar);
      if (card)
        layer.appendChild(card);
    }
  }
  function buildToolbar(item, rect, placeAbove) {
    const top = placeAbove ? rect.top - (TOOLBAR_H + TOOLBAR_GAP) : rect.bottom + TOOLBAR_GAP;
    const left = Math.max(8, rect.left - 2);
    const attached = item.committed;
    const styleCount = item.styles.length;
    const styleTotal = getStyleGroups(item.id).reduce((s, g) => s + g.props.length, 0);
    const tb = document.createElement("div");
    tb.className = "toolbar";
    tb.style.top = `${top}px`;
    tb.style.left = `${left}px`;
    tb.innerHTML = `
    <span class="tb-selector" title="${escapeAttr(item.selector)}">
      <span class="sel-dot${attached ? " attached" : ""}"></span>${escapeHtml2(item.label)}
    </span>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-btn-icon${ui.popcard === "edit" ? " is-active" : ""}${item.note.trim() ? " has-note" : ""}" data-act="edit" title="Edit">
      <svg viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-7 7H3.5v-3l7-7zM9 4l3 3"/></svg>
    </button>
    <button class="tb-btn${ui.popcard === "style" ? " is-active" : ""}${styleCount > 0 ? " has-note" : ""}" data-act="style">
      Style <span class="tb-sub">${styleCount}/${styleTotal}</span>
    </button>
    <button class="tb-btn${ui.popcard === "html" ? " is-active" : ""}${item.htmlAttached ? " has-note" : ""}" data-act="html">
      HTML <span class="tb-sub">${item.htmlMode === "simplified" ? "Simplified" : "Full"}</span>
    </button>
    <span class="tb-divider"></span>
    <button class="tb-btn tb-attach${attached ? " is-done" : ""}" data-act="attach">${attached ? "✓ Attached" : "+ Attach"}</button>
  `;
    tb.querySelectorAll(".tb-btn").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const act = btn.dataset.act;
        if (act === "attach") {
          if (item.committed)
            uncommitItem(item.id);
          else {
            commitItem(item.id);
            emit({ type: "chip-insert-request", id: item.id });
          }
          return;
        }
        ui.popcard = ui.popcard === act ? null : act;
        render(btn.closest("[data-dsai-toolbar]"));
      });
    });
    return tb;
  }
  function buildPopcard(kind, item, rect, toolbarAbove, toolbar) {
    let card = null;
    if (kind === "edit")
      card = buildEditCard(item);
    else if (kind === "style")
      card = buildStyleCard(item);
    else if (kind === "html")
      card = buildHtmlCard(item);
    if (!card)
      return null;
    const width = kind === "style" ? 480 : 320;
    placeCard(card, rect, width, toolbarAbove);
    requestAnimationFrame(() => alignArrow(card, toolbar, kind));
    return card;
  }
  function placeCard(card, rect, width, toolbarAbove) {
    let left = rect.left;
    const overflow = left + width - window.innerWidth + 12;
    if (overflow > 0)
      left -= overflow;
    card.style.left = `${Math.max(8, left)}px`;
    const baseTop = toolbarAbove ? rect.bottom + TOOLBAR_GAP : rect.bottom + TOOLBAR_GAP + TOOLBAR_H + TOOLBAR_GAP;
    card.style.top = `${baseTop}px`;
  }
  function alignArrow(card, toolbar, kind) {
    const btn = toolbar.querySelector(`[data-act="${kind}"]`);
    if (!btn)
      return;
    const btnRect = btn.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const x = Math.max(16, Math.min(cardRect.width - 28, btnRect.left + btnRect.width / 2 - cardRect.left - 6));
    card.style.setProperty("--arrow-x", `${x}px`);
  }
  function buildEditCard(item) {
    const card = document.createElement("div");
    card.className = "popcard from-edit";
    card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">Modification</span>
      <span class="popcard-meta" title="${escapeAttr(item.selector)}">${escapeHtml2(item.label)}</span>
    </div>
    <div class="edit-body">
      <textarea placeholder="描述你想对这个元素做的改动…">${escapeHtml2(item.note)}</textarea>
    </div>
    <div class="edit-actions">
      <button class="ghost" data-act="cancel">Cancel</button>
      <button class="primary" data-act="save">Save</button>
    </div>
  `;
    const ta = card.querySelector("textarea");
    card.querySelector('[data-act="cancel"]').addEventListener("click", () => {
      ui.popcard = null;
      setActive(item.id);
    });
    card.querySelector('[data-act="save"]').addEventListener("click", () => {
      updateNote(item.id, ta.value);
      ui.popcard = null;
      setActive(item.id);
    });
    return card;
  }
  function buildStyleCard(item) {
    const groups = getStyleGroups(item.id);
    const activeId = ui.activeStyleGroup;
    const active = groups.find((g) => g.id === activeId) ?? groups[0];
    const selected = new Map(item.styles.map((p) => [p.k, p]));
    const totalProps = groups.reduce((s, g) => s + g.props.length, 0);
    const allOn = totalProps > 0 && item.styles.length === totalProps;
    const card = document.createElement("div");
    card.className = "popcard from-style";
    card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">Computed Styles</span>
      <span class="popcard-meta">${item.styles.length} selected</span>
    </div>
    <div class="style-split">
      <div class="style-groups">
        ${groups.map((g) => {
      const sel = g.props.filter((p) => selected.has(p.k)).length;
      const hasSel = sel > 0 ? " has-selection" : "";
      const isActive = g.id === active.id ? " is-active" : "";
      return `<div class="style-group${isActive}${hasSel}" data-group="${g.id}">
            <span class="sg-name">${g.title}</span>
            <span class="sg-count">${sel}/${g.props.length}</span>
          </div>`;
    }).join("")}
      </div>
      <div class="style-props">
        <div class="style-props-head">
          <span class="sp-title">${active.title} · ${active.props.length} properties</span>
          <button class="sp-toggle">${active.props.every((p) => selected.has(p.k)) && active.props.length ? "Clear all" : "Select all"}</button>
        </div>
        <div class="prop-chips">
          ${active.props.map((p) => {
      const on = selected.has(p.k);
      return `<label class="prop-chip${on ? " is-on" : ""}">
              <input type="checkbox" data-key="${escapeAttr(p.k)}"${on ? " checked" : ""}>
              ${p.swatch ? `<span class="prop-swatch" style="background:${escapeAttr(p.swatch)}"></span>` : ""}
              <span class="prop-key">${escapeHtml2(p.k)}</span>
              <span class="prop-val">${escapeHtml2(p.v)}</span>
            </label>`;
    }).join("")}
        </div>
      </div>
    </div>
    <div class="style-footer">
      <label class="all-toggle">
        <input type="checkbox" data-act="all"${allOn ? " checked" : ""}>
        All non-default styles
      </label>
      <span class="footer-meta">${item.styles.length} / ${totalProps} attached</span>
      <button class="add-btn" data-act="done">Done</button>
    </div>
  `;
    const lookup = new Map(groups.flatMap((g) => g.props.map((p) => [p.k, p])));
    card.querySelectorAll(".style-group").forEach((g) => {
      g.addEventListener("click", () => {
        ui.activeStyleGroup = g.dataset.group;
        setActive(item.id);
      });
    });
    card.querySelectorAll(".prop-chip input").forEach((cb) => {
      cb.addEventListener("change", () => {
        const key = cb.dataset.key;
        const cur = [...selected.values()];
        const next = cb.checked ? [...cur, lookup.get(key)].filter((p) => !!p) : cur.filter((p) => p.k !== key);
        updateStyles(item.id, next);
      });
    });
    card.querySelector(".sp-toggle").addEventListener("click", () => {
      const allOnNow = active.props.every((p) => selected.has(p.k)) && active.props.length > 0;
      const otherGroups = item.styles.filter((p) => !active.props.some((ap) => ap.k === p.k));
      const next = allOnNow ? otherGroups : [...otherGroups, ...active.props];
      updateStyles(item.id, next);
    });
    card.querySelector('[data-act="all"]').addEventListener("change", (e) => {
      const checked = e.currentTarget.checked;
      const next = checked ? groups.flatMap((g) => g.props) : [];
      updateStyles(item.id, next);
    });
    card.querySelector('[data-act="done"]').addEventListener("click", () => {
      ui.popcard = null;
      setActive(item.id);
    });
    return card;
  }
  function buildHtmlCard(item) {
    const card = document.createElement("div");
    card.className = "popcard from-html";
    card.innerHTML = `
    <div class="popcard-header">
      <span class="popcard-title">HTML Snapshot</span>
      <span class="popcard-meta" title="${escapeAttr(item.selector)}">${escapeHtml2(item.label)}</span>
    </div>
    <p class="html-hint">选择把哪种 HTML 形式附加到 prompt。</p>
    <div class="html-tabs">
      <button class="html-tab${item.htmlMode === "simplified" ? " is-on" : ""}" data-mode="simplified">
        <span class="ht-label">Simplified</span>
        <span class="ht-desc">仅自身节点 · 不含子元素</span>
      </button>
      <button class="html-tab${item.htmlMode === "full" ? " is-on" : ""}" data-mode="full">
        <span class="ht-label">Full</span>
        <span class="ht-desc">含所有后代 · 文本截 100 字</span>
      </button>
    </div>
    <div class="html-code-wrap">
      <pre class="html-code">${highlightHtml(item.htmlSnap.html)}</pre>
    </div>
    <div class="html-footer">
      <span class="html-meta">${item.htmlSnap.lineCount} 行 · ${item.htmlSnap.charCount} 字符</span>
      <button class="html-attach${item.htmlAttached ? " is-attached" : ""}" data-act="toggle">${item.htmlAttached ? "Detach" : "Attach to prompt"}</button>
    </div>
  `;
    card.querySelectorAll(".html-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.mode;
        updateHtmlMode(item.id, mode);
      });
    });
    card.querySelector('[data-act="toggle"]').addEventListener("click", () => {
      setHtmlAttached(item.id, !item.htmlAttached);
    });
    return card;
  }
  function escapeHtml2(s) {
    return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function escapeAttr(s) {
    return escapeHtml2(s);
  }
  function highlightHtml(src) {
    const TAG = /<\/?[A-Za-z][^>]*>/g;
    let out = "";
    let i = 0;
    let m;
    while (m = TAG.exec(src)) {
      if (m.index > i)
        out += escapeHtml2(src.slice(i, m.index));
      out += highlightTag(m[0]);
      i = m.index + m[0].length;
    }
    if (i < src.length)
      out += escapeHtml2(src.slice(i));
    return out;
  }
  function highlightTag(tag) {
    const m = /^<(\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(tag);
    if (!m)
      return escapeHtml2(tag);
    const [, slash, name, attrs, selfClose] = m;
    const attrPart = highlightAttrs(attrs);
    return `<span class="html-punct">&lt;${slash}</span>` + `<span class="html-tag">${escapeHtml2(name)}</span>` + attrPart + `<span class="html-punct">${selfClose ? "/" : ""}&gt;</span>`;
  }
  function highlightAttrs(raw) {
    const ATTR = /(\s+)([A-Za-z_:][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`<>=]+)?/g;
    let out = "";
    let i = 0;
    let m;
    while (m = ATTR.exec(raw)) {
      if (m.index > i)
        out += escapeHtml2(raw.slice(i, m.index));
      const [, ws, key, eq, val] = m;
      out += escapeHtml2(ws);
      out += `<span class="html-attr">${escapeHtml2(key)}</span>`;
      if (eq && val !== undefined) {
        out += escapeHtml2(eq);
        const isString = /^["']/.test(val);
        out += isString ? `<span class="html-str">${escapeHtml2(val)}</span>` : `<span class="html-val">${escapeHtml2(val)}</span>`;
      } else if (eq) {
        out += escapeHtml2(eq);
      }
      i = m.index + m[0].length;
    }
    if (i < raw.length)
      out += escapeHtml2(raw.slice(i));
    return out;
  }

  // src/core/interact.ts
  var HOST_ID = "__dom_snapshot_ai_root__";
  var MOUSE_EVENTS = ["mousedown", "mouseup", "click", "contextmenu", "dblclick", "auxclick"];
  function initInteract(cb) {
    const hoverEl = makeOverlay({
      border: "1.5px dashed #0066cc",
      background: "rgba(0, 102, 204, 0.045)"
    });
    const selectedEl = makeOverlay({
      border: "2px solid #0066cc",
      background: "rgba(0, 102, 204, 0.055)",
      transition: "none"
    });
    document.body.appendChild(selectedEl);
    document.body.appendChild(hoverEl);
    let bound = false;
    let disposed = false;
    const positionSelected = () => {
      const id = getState().activeId;
      const el = id ? getElement(id) : null;
      if (!el) {
        selectedEl.style.display = "none";
        return;
      }
      const r = el.getBoundingClientRect();
      Object.assign(selectedEl.style, {
        display: "block",
        left: `${r.left - 3}px`,
        top: `${r.top - 3}px`,
        width: `${r.width + 2}px`,
        height: `${r.height + 2}px`
      });
    };
    const onMove = (e) => {
      if (isFromPanel(e)) {
        hoverEl.style.display = "none";
        return;
      }
      const el = pickEl(e.clientX, e.clientY);
      const activeEl = getElement(getState().activeId ?? "");
      if (!el || el === activeEl) {
        hoverEl.style.display = "none";
        return;
      }
      const r = el.getBoundingClientRect();
      Object.assign(hoverEl.style, {
        display: "block",
        left: `${r.left - 2}px`,
        top: `${r.top - 2}px`,
        width: `${r.width}px`,
        height: `${r.height}px`
      });
    };
    const blocker = (e) => {
      if (isFromPanel(e))
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.type !== "click")
        return;
      const el = pickEl(e.clientX, e.clientY);
      if (!el)
        return;
      const id = addElement(el, e.shiftKey);
      hoverEl.style.display = "none";
      cb.onSelect(el, id);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        clearAll();
        hoverEl.style.display = "none";
        selectedEl.style.display = "none";
        return;
      }
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setEnabled(!getState().enabled);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        tryNavigate(e);
      }
    };
    const tryNavigate = (e) => {
      const target = e.target;
      if (target instanceof Element) {
        if (target.closest(`#${HOST_ID}`))
          return;
        if (target instanceof HTMLElement && target.isContentEditable)
          return;
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
          return;
      }
      const id = getState().activeId;
      if (!id)
        return;
      const cur = getElement(id);
      if (!cur)
        return;
      let next = null;
      if (e.key === "ArrowUp")
        next = cur.parentElement;
      else if (e.key === "ArrowDown")
        next = cur.firstElementChild;
      else if (e.key === "ArrowLeft")
        next = cur.previousElementSibling;
      else if (e.key === "ArrowRight")
        next = cur.nextElementSibling;
      if (!next || next === document.body || next === document.documentElement)
        return;
      e.preventDefault();
      addElement(next, false);
    };
    const onScroll = () => positionSelected();
    const bindCaptureListeners = () => {
      for (const t of MOUSE_EVENTS) {
        window.addEventListener(t, blocker, { capture: true, passive: false });
      }
      window.addEventListener("mousemove", onMove, true);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
    };
    const unbindCaptureListeners = () => {
      for (const t of MOUSE_EVENTS) {
        window.removeEventListener(t, blocker, { capture: true });
      }
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      hoverEl.style.display = "none";
      selectedEl.style.display = "none";
    };
    const reactToEnabled = () => {
      const { enabled } = getState();
      if (enabled && !bound) {
        bindCaptureListeners();
        bound = true;
      } else if (!enabled && bound) {
        unbindCaptureListeners();
        bound = false;
      }
    };
    document.addEventListener("keydown", onKey, true);
    const unsubscribe = subscribe(() => {
      reactToEnabled();
      positionSelected();
    });
    reactToEnabled();
    return () => {
      if (disposed)
        return;
      disposed = true;
      if (bound) {
        unbindCaptureListeners();
        bound = false;
      }
      document.removeEventListener("keydown", onKey, true);
      unsubscribe();
      hoverEl.remove();
      selectedEl.remove();
      setPanelCollapsed(false);
    };
  }
  function makeOverlay(extra) {
    const el = document.createElement("div");
    el.setAttribute("data-dsai-overlay", "");
    Object.assign(el.style, {
      position: "fixed",
      pointerEvents: "none",
      borderRadius: "4px",
      zIndex: "2147483646",
      transition: "all 60ms ease-out",
      display: "none"
    });
    Object.assign(el.style, extra);
    return el;
  }
  function pickEl(x, y) {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (el.id === HOST_ID)
        continue;
      if (el.closest(`#${HOST_ID}`))
        continue;
      if (el.hasAttribute("data-dsai-overlay"))
        continue;
      if (el.hasAttribute("data-dsai-toolbar"))
        continue;
      if (el === document.documentElement || el === document.body)
        continue;
      return el;
    }
    return null;
  }
  function isFromPanel(e) {
    const path = e.composedPath();
    for (const n of path) {
      if (n instanceof Element && n.id === HOST_ID)
        return true;
    }
    return false;
  }

  // src/index.ts
  var MOUNT_ID = "__dom_snapshot_ai_root__";
  function mount() {
    if (document.getElementById(MOUNT_ID))
      return;
    const host = document.createElement("div");
    host.id = MOUNT_ID;
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styles_default;
    root.appendChild(style);
    renderPanel(root);
    initToolbar(root);
    initInteract({ onSelect: () => {} });
  }
  mount();
})();
