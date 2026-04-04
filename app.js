const manifestPath = "content/library-manifest.json";

const state = {
  entries: [],
  filter: "all",
  activeId: null,
};

const libraryList = document.getElementById("library-list");
const previewPanel = document.getElementById("library-preview");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));

initialize();

async function initialize() {
  wireFilters();

  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Manifest request failed with ${response.status}`);
    }

    const manifest = await response.json();
    state.entries = Array.isArray(manifest.entries) ? manifest.entries : [];
    state.activeId = state.entries[0]?.id ?? null;

    renderLibrary();
    renderPreview();
  } catch (error) {
    renderManifestError(error);
  }
}

function wireFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      const visibleEntries = getFilteredEntries();

      if (!visibleEntries.some((entry) => entry.id === state.activeId)) {
        state.activeId = visibleEntries[0]?.id ?? null;
      }

      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      renderLibrary();
      renderPreview();
    });
  });
}

function getFilteredEntries() {
  if (state.filter === "all") {
    return state.entries;
  }

  return state.entries.filter((entry) => entry.kind === state.filter);
}

function renderLibrary() {
  const entries = getFilteredEntries();

  if (!entries.length) {
    libraryList.innerHTML = `
      <div class="empty-state">
        No entries match the current filter yet. Add Markdown files to the content
        folders and rebuild the manifest.
      </div>
    `;
    return;
  }

  libraryList.innerHTML = "";

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-entry";
    button.classList.toggle("is-active", entry.id === state.activeId);
    button.innerHTML = `
      <div class="entry-meta">
        <span class="pill">${formatKind(entry.kind)}</span>
        <span class="pill">${entry.status || "Draft"}</span>
      </div>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.summary || "No summary provided yet.")}</p>
      <div class="entry-footer">
        <span>${formatLocation(entry)}</span>
        <span class="entry-link">Preview text</span>
      </div>
    `;
    button.addEventListener("click", () => {
      state.activeId = entry.id;
      renderLibrary();
      renderPreview();
    });
    libraryList.appendChild(button);
  });
}

async function renderPreview() {
  const entry = getFilteredEntries().find((item) => item.id === state.activeId);

  if (!entry) {
    previewPanel.innerHTML = `
      <div class="preview-empty">
        <p class="preview-label">Nothing Selected</p>
        <h3>Select a library item</h3>
        <p>Choose a chapter, scene, or play to render it here.</p>
      </div>
    `;
    return;
  }

  previewPanel.innerHTML = `
    <div class="preview-empty">
      <p class="preview-label">Loading</p>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>Pulling the Markdown source into the preview panel.</p>
    </div>
  `;

  try {
    const response = await fetch(entry.path);
    if (!response.ok) {
      throw new Error(`Content request failed with ${response.status}`);
    }

    const markdown = await response.text();
    previewPanel.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <p class="preview-label">Rendered Preview</p>
          <h3>${escapeHtml(entry.title)}</h3>
        </div>
        <div class="preview-meta">
          <span class="pill">${formatKind(entry.kind)}</span>
          <span class="pill">${entry.status || "Draft"}</span>
        </div>
        <div class="preview-body">${renderMarkdown(markdown)}</div>
        <div class="preview-footer">
          <span>${formatLocation(entry)}</span>
          <a class="preview-link" href="${encodeURI(entry.path)}" target="_blank" rel="noreferrer">
            Open source Markdown
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    previewPanel.innerHTML = `
      <div class="preview-empty">
        <p class="preview-label">Preview Error</p>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function renderManifestError(error) {
  libraryList.innerHTML = `
    <div class="empty-state">
      The story manifest could not be loaded. Run
      <code>python3 scripts/build_library_manifest.py</code> and serve the site with
      <code>python3 -m http.server</code>.
    </div>
  `;

  previewPanel.innerHTML = `
    <div class="preview-empty">
      <p class="preview-label">Manifest Missing</p>
      <h3>Story library is not ready yet</h3>
      <p>${escapeHtml(error.message)}</p>
    </div>
  `;
}

function renderMarkdown(markdown) {
  const cleaned = stripFrontMatter(markdown).replace(/\r\n/g, "\n");
  const lines = cleaned.split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) {
      return;
    }

    html.push(listType === "ul" ? "</ul>" : "</ol>");
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      return;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      return;
    }

    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      flushParagraph();
      closeList();
      html.push("<hr />");
      return;
    }

    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInline(blockquoteMatch[1])}</blockquote>`);
      return;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInline(orderedMatch[1])}</li>`);
      return;
    }

    closeList();
    paragraph.push(line);
  });

  flushParagraph();
  closeList();

  return html.join("");
}

function stripFrontMatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return markdown;
  }

  const endIndex = markdown.indexOf("\n---", 4);
  if (endIndex === -1) {
    return markdown;
  }

  return markdown.slice(endIndex + 4).trimStart();
}

function renderInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatKind(kind) {
  if (kind === "chapter") {
    return "Chapter";
  }

  if (kind === "scene") {
    return "Scene";
  }

  if (kind === "play") {
    return "Play";
  }

  return "Entry";
}

function formatLocation(entry) {
  const order = entry.order ? `#${String(entry.order).padStart(2, "0")}` : "Unordered";
  return `${formatKind(entry.kind)} ${order}`;
}
