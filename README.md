# Divine Chamber Story Hub

This repository contains a Bootstrap-based static site for the Divine Chamber story
project. The site includes:

- a character section
- a narrative section
- a story library that renders chapters, scenes, and plays from Markdown files

## Frontend stack

- Bootstrap 5.3.8 via CDN
- custom theme overrides in `styles.css`
- plain JavaScript for the Markdown library browser

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
