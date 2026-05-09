# AGENTS.md

## Project

moodie — Single-file PWA mood tracker. All code lives in `docs/index.html` (CSS + JS inline). Served via GitHub Pages from `docs/`.

## Local Development

```bash
# Serve docs/ on localhost
cd docs && python3 -m http.server 8080
# Open http://localhost:8080
```

No build step. No dependencies. Edit `docs/index.html` directly.

## Architecture

- `docs/index.html` — Everything. ~1200 lines: HTML shell, `<style>` block, `<script>` block.
- `docs/sw.js` — Service worker. Cache-first for shell files.
- `docs/manifest.json` — PWA manifest.
- `docs/icons/` — 192px + 512px PNGs. Generated once, rarely change.

### Data Model

User data in `localStorage`:
- `moodie_data` → `{entries: {"2026-05-10": {"09:00": {mood, core, specific, nuanced, activity}}}}`
- `moodie_theme` → `"system" | "light" | "dark"`
- `moodie_sync` → `{token, gist_id}` for GitHub Gist backup

### CSS Architecture

Theme system via `data-theme` attribute on `<html>`. Three modes: `dark` (default), `light`, `system` (reads `prefers-color-scheme`). All colors are CSS custom properties. Transition durations on `body` for smooth switching.

### JS Structure

- Data helpers: `loadData`, `saveData`, `getEntry`, `setEntry`
- Renderers: `renderToday`, `renderHistory`, `renderReview`, `renderSettings`
- Check-in flow: `openCheckin` → modal with 3 swipe pages (mood → emotion → activity)
- Gloria Willcox feeling wheel: hardcoded `WHEEL` object with 3 layers
- Sync: `syncUp` pushes to GitHub Gist

## Gotchas

- **Cache busting**: When releasing, bump `CACHE_NAME` in `sw.js` (e.g., `moodie-v1` → `moodie-v2`). Users with old SW cached will see stale shell until browser refreshes.
- **Google Fonts**: Playfair Display loaded from `fonts.googleapis.com`. App degrades gracefully to Georgia if fonts fail.
- **No test suite**: Verify manually by running local server and clicking through all flows.
- **Icons**: Must exist at `icons/icon-192.png` and `icons/icon-512.png`. If regenerating, keep transparent background or match manifest `purpose`.
- **GitHub Pages path**: Site lives at `/moodie/` (repo name). All internal links and `start_url` use this prefix. Do not change to `/` unless also changing repo name.
- **Single-file constraint**: This is intentional. Everything must stay in `index.html`. No external CSS/JS files. Only exception: Google Fonts CDN and service worker.
