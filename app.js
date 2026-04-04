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
    button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      const visibleEntries = getFilteredEntries();

      if (!visibleEntries.some((entry) => entry.id === state.activeId)) {
        state.activeId = visibleEntries[0]?.id ?? null;
      }

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
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
      <div class="card empty-state-card border-0 entry-surface">
        <div class="card-body p-4">
          <span class="section-tag">No Matches</span>
          <p class="empty-state-copy mt-3 mb-0">
            No entries match the current filter yet. Add Markdown files to the
            content folders and rebuild the manifest.
          </p>
        </div>
      </div>
    `;
    return;
  }

  libraryList.innerHTML = "";

  entries.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "story-entry";
    button.classList.toggle("is-active", entry.id === state.activeId);
    button.setAttribute("aria-label", `Preview ${entry.title}`);
    button.innerHTML = `
      <span class="entry-surface card border-0">
        <span class="card-body d-block p-4">
          <span class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge badge-tag">${formatKind(entry.kind)}</span>
            <span class="badge badge-tag">${escapeHtml(entry.status || "Draft")}</span>
          </span>
          <span class="entry-title d-block">${escapeHtml(entry.title)}</span>
          <span class="entry-summary d-block mt-3">
            ${escapeHtml(entry.summary || "No summary provided yet.")}
          </span>
          <span class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 text-secondary small">
            <span>${formatLocation(entry)}</span>
            <span>Preview text</span>
          </span>
        </span>
      </span>
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
      <div class="card-body p-4 p-lg-5 preview-placeholder">
        <span class="section-tag">Nothing Selected</span>
        <h3 class="preview-title h2 mt-4">Select a library item</h3>
        <p class="section-copy mt-3 mb-0">
          Choose a chapter, scene, or play to render it here.
        </p>
      </div>
    `;
    return;
  }

  previewPanel.innerHTML = `
    <div class="card-body p-4 p-lg-5 preview-placeholder">
      <span class="section-tag">Loading</span>
      <h3 class="preview-title h2 mt-4">${escapeHtml(entry.title)}</h3>
      <div class="d-flex align-items-center gap-3 mt-3 section-copy">
        <div class="spinner-border spinner-border-sm text-warning" role="status" aria-hidden="true"></div>
        <span>Pulling the Markdown source into the preview panel.</span>
      </div>
    </div>
  `;

  try {
    const response = await fetch(entry.path);
    if (!response.ok) {
      throw new Error(`Content request failed with ${response.status}`);
    }

    const markdown = await response.text();
    previewPanel.innerHTML = `
      <div class="card-body p-4 p-lg-5">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <span class="section-tag">Rendered Preview</span>
            <h3 class="preview-title h2 mt-4 mb-0">${escapeHtml(entry.title)}</h3>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge badge-tag">${formatKind(entry.kind)}</span>
            <span class="badge badge-tag">${escapeHtml(entry.status || "Draft")}</span>
          </div>
        </div>
        <div class="preview-body">${renderMarkdown(markdown)}</div>
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4 pt-2 border-top border-secondary-subtle">
          <span class="text-secondary small">${formatLocation(entry)}</span>
          <a
            class="btn btn-outline-light btn-sm preview-link"
            href="${encodeURI(entry.path)}"
            target="_blank"
            rel="noreferrer"
          >
            Open source Markdown
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    previewPanel.innerHTML = `
      <div class="card-body p-4 p-lg-5 preview-placeholder">
        <span class="section-tag">Preview Error</span>
        <h3 class="preview-title h2 mt-4">${escapeHtml(entry.title)}</h3>
        <p class="section-copy mt-3 mb-0">${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function renderManifestError(error) {
  libraryList.innerHTML = `
    <div class="card empty-state-card border-0 entry-surface">
      <div class="card-body p-4">
        <span class="section-tag">Manifest Missing</span>
        <p class="empty-state-copy mt-3 mb-0">
          The story manifest could not be loaded. Run
          <code>python3 scripts/build_library_manifest.py</code> and serve the site
          with <code>python3 -m http.server</code>.
        </p>
      </div>
    </div>
  `;

  previewPanel.innerHTML = `
    <div class="card-body p-4 p-lg-5 preview-placeholder">
      <span class="section-tag">Story Library Offline</span>
      <h3 class="preview-title h2 mt-4">Manifest missing or unavailable</h3>
      <p class="section-copy mt-3 mb-0">${escapeHtml(error.message)}</p>
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
