# Divine Chamber Story Hub

This repository contains a Bootstrap-based static site for the Divine Chamber story
project. The site now uses separate pages instead of one long scrolling homepage.

- `index.html` for the overview
- `characters.html` for the character ledger
- `narrative.html` for the narrative page
- `library.html` for the archive browser
- `reader.html` for individual Markdown entries

## Frontend stack

- Bootstrap 5.3.8 via CDN
- custom theme overrides in `styles.css`
- plain JavaScript for the character page, library browser, and reader page

## Content structure

Story files live in dedicated folders:

- `content/chapters`
- `content/scenes`
- `content/plays`

Each Markdown file can include simple front matter:

```md
---
title: Chapter II - Echoes
order: 2
status: Draft
summary: A short one-line description for the library card.
---
```

## Update the library

Whenever you add or rename Markdown files, rebuild the manifest:

```bash
python3 scripts/build_library_manifest.py
```

## Preview locally

Serve the site from the repository root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).
