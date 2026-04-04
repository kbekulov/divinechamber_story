#!/usr/bin/env python3

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content"
OUTPUT_FILE = CONTENT_DIR / "library-manifest.json"
SCAN_FOLDERS = {
    "chapter": CONTENT_DIR / "chapters",
    "scene": CONTENT_DIR / "scenes",
    "play": CONTENT_DIR / "plays",
}
KIND_ORDER = {"chapter": 0, "scene": 1, "play": 2}


def parse_front_matter(markdown_text):
    if not markdown_text.startswith("---\n"):
        return {}

    _, _, remainder = markdown_text.partition("\n")
    metadata_block, separator, _ = remainder.partition("\n---\n")
    if not separator:
        return {}

    metadata = {}
    for line in metadata_block.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip()

    return metadata


def build_entry(kind, path):
    raw_text = path.read_text(encoding="utf-8")
    metadata = parse_front_matter(raw_text)
    relative_path = path.relative_to(ROOT).as_posix()
    order = metadata.get("order", "999")

    try:
        numeric_order = int(order)
    except ValueError:
        numeric_order = 999

    return {
        "id": f"{kind}-{path.stem}",
        "title": metadata.get("title", path.stem.replace("-", " ").title()),
        "kind": metadata.get("kind", kind),
        "status": metadata.get("status", "Draft"),
        "summary": metadata.get("summary", "No summary provided yet."),
        "order": numeric_order,
        "path": relative_path,
    }


def main():
    entries = []

    for kind, folder in SCAN_FOLDERS.items():
        if not folder.exists():
            continue
        for path in sorted(folder.glob("*.md")):
            entries.append(build_entry(kind, path))

    entries.sort(
        key=lambda item: (
            KIND_ORDER.get(item["kind"], 99),
            item["order"],
            item["title"],
        )
    )
    OUTPUT_FILE.write_text(
        json.dumps({"entries": entries}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(entries)} entries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
