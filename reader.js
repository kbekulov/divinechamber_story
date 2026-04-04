const manifestPath = "content/library-manifest.json";
const titleNode = document.getElementById("reader-title");
const kindNode = document.getElementById("reader-kind");
const summaryNode = document.getElementById("reader-summary");
const metaNode = document.getElementById("reader-meta");
const bodyNode = document.getElementById("reader-body");
const relatedNode = document.getElementById("related-list");
const sourceLink = document.getElementById("reader-source-link");

if (titleNode && kindNode && summaryNode && metaNode && bodyNode && relatedNode && sourceLink) {
  initializeReader();
}

async function initializeReader() {
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("id");

  if (!entryId) {
    renderMissing("No story entry id was provided in the URL.");
    return;
  }

  try {
    const manifestResponse = await fetch(manifestPath);
    if (!manifestResponse.ok) {
      throw new Error(`Manifest request failed with ${manifestResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
    const entry = entries.find((item) => item.id === entryId);

    if (!entry) {
      renderMissing("This story entry could not be found in the manifest.");
      return;
    }

    document.title = `${entry.title} | Divine Chamber`;
    kindNode.textContent = formatKind(entry.kind);
    titleNode.textContent = entry.title;
    summaryNode.textContent = entry.summary || "No summary provided yet.";
    sourceLink.href = entry.path;
    metaNode.innerHTML = `
      <span class="meta-pill">${formatKind(entry.kind)}</span>
      <span class="meta-pill">${escapeHtml(entry.status || "Draft")}</span>
      <span class="meta-pill">${formatOrder(entry.order)}</span>
    `;

    const storyResponse = await fetch(entry.path);
    if (!storyResponse.ok) {
      throw new Error(`Content request failed with ${storyResponse.status}`);
    }

    const markdown = await storyResponse.text();
    bodyNode.innerHTML = renderMarkdown(markdown);
    renderRelated(entries, entry);
  } catch (error) {
    renderMissing(error.message);
  }
}

function renderMissing(message) {
  kindNode.textContent = "Reader";
  titleNode.textContent = "Entry unavailable";
  summaryNode.textContent = message;
  metaNode.innerHTML = "";
  bodyNode.innerHTML = `<p class="page-copy mb-0">${escapeHtml(message)}</p>`;
  relatedNode.innerHTML = `
    <div class="related-card">
      <p class="empty-state-copy mb-0">Return to the library and choose another entry.</p>
    </div>
  `;
  sourceLink.classList.add("disabled");
  sourceLink.removeAttribute("href");
}

function renderRelated(entries, currentEntry) {
  const related = entries.filter(
    (entry) => entry.id !== currentEntry.id && entry.kind === currentEntry.kind
  );

  if (!related.length) {
    relatedNode.innerHTML = `
      <div class="related-card">
        <p class="empty-state-copy mb-0">No related entries of this type yet.</p>
      </div>
    `;
    return;
  }

  relatedNode.innerHTML = related
    .map(
      (entry) => `
        <article class="related-card">
          <span class="entry-kind">${formatKind(entry.kind)}</span>
          <h2 class="entry-title mt-3 mb-2">${escapeHtml(entry.title)}</h2>
          <p class="entry-summary mb-3">${escapeHtml(entry.summary || "No summary provided yet.")}</p>
          <a class="btn btn-outline-dark btn-sm" href="reader.html?id=${encodeURIComponent(entry.id)}">
            Open
          </a>
        </article>
      `
    )
    .join("");
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

function formatOrder(order) {
  if (!order) {
    return "Unordered";
  }

  return `#${String(order).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
