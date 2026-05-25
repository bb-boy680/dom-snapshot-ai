# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based DOM snapshot + AI prompt generator tool. Users activate a floating inspection mode on any webpage, click to select DOM elements, capture their HTML and computed styles, attach modification requests, and export structured prompts (Markdown/JSON) for use with AI tools like ChatGPT or Claude.

Deployment target: bookmarklet first (MVP), Chrome extension later.

## DESIGN.md — Design System Specification

DESIGN.md is the canonical design token file. It uses YAML frontmatter (between `---` markers) to define structured tokens, followed by markdown prose documentation. The YAML block is machine-readable; the prose is the human-readable rationale.

**Token sections in the YAML frontmatter:**
- `colors` — Hex values keyed by semantic name (e.g., `primary: "#0066cc"`)
- `typography` — Font stacks, sizes, weights, line-height, letter-spacing
- `rounded` — Border radius scale (`none` through `pill`)
- `spacing` — Spacing scale (`xxs` through `section`)
- `components` — Component definitions referencing color/typography/rounded/spacing tokens via `{token.path}` syntax

**Key design rules (from DESIGN.md):**
- Use `{token.refs}` everywhere — never inline hex values, font stacks, or spacing
- Single accent color: `{colors.primary}` (#0066cc Action Blue) for all interactive elements
- Body copy is 17px (not 16px); headlines use weight 600 (not 700), negative letter-spacing
- Full-bleed product tiles alternate light/dark — the color change is the divider, no borders
- Exactly one drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`), reserved for product imagery only
- Button active state is `transform: scale(0.95)` system-wide
- No decorative gradients; no shadows on cards, buttons, or text
- Minimum touch target: 44×44px
- Font: SF Pro Display (headlines ≥ 19px) / SF Pro Text (body/UI < 20px); substitute Inter on non-Apple platforms

Refer to DESIGN.md's "Iteration Guide" and "Do's and Don'ts" sections before implementing any UI.

## README.md — Feature Requirements

The README (Chinese language) defines the full feature list and MVP scope. Key MVP items (P0):

1. Activate floating inspection mode (floating button + element highlighting on hover)
2. Click to select elements, show simplified HTML + computed styles (layout + text groups)
3. Multi-select with tag chips (each removable)
4. Main prompt input box + copy button → formatted Markdown output
5. Full HTML toggle (default: simplified outerHTML only, no children)
6. Style group filtering (Layout, Text, Background & Border, Effects, Other)
7. Bookmarklet distribution

See README.md for the complete prioritized feature table, output format examples, and advanced features (pseudo-element styles, Shadow DOM support, iframe support, etc.).

## Project Structure

```
.claude/                  # Claude Code configuration
  settings.local.json     # Permissions: allows curl, WebSearch, WebFetch
DESIGN.md                 # Design system spec (YAML tokens + prose)
README.md                 # Feature requirements (Chinese)
```

No source code exists yet — the project is in specification phase. Implementation will likely be vanilla JS/TS bundled into a bookmarklet, with no framework dependency (to minimize injection footprint on host pages).
