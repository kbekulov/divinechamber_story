const manifestPath = "content/library-manifest.json";

const state = {
  entries: [],
  filter: "all",
};

const libraryList = document.getElementById("library-list");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));

if (libraryList) {
  initializeLibrary();
}

async function initializeLibrary() {
  wireFilters();

  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Manifest request failed with ${response.status}`);
    }

    const manifest = await response.json();
    state.entries = Array.isArray(manifest.entries) ? manifest.entries : [];
    renderEntries();
  } catch (error) {
    libraryList.innerHTML = `
      <div class="entry-card">
        <p class="card-kicker">Manifest Missing</p>
        <p class="empty-state-copy mb-0">
          ${escapeHtml(error.message)}. Rebuild the archive with
          <code>python3 scripts/build_library_manifest.py</code>.
        </p>
      </div>
    `;
  }
}

function wireFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      renderEntries();
    });
  });
}

function getEntries() {
  if (state.filter === "all") {
    return state.entries;
  }

  return state.entries.filter((entry) => entry.kind === state.filter);
}

function renderEntries() {
  const entries = getEntries();

  if (!entries.length) {
    libraryList.innerHTML = `
      <div class="entry-card">
        <p class="card-kicker">No Entries</p>
        <p class="empty-state-copy mb-0">
          No items match this filter yet.
        </p>
      </div>
    `;
    return;
  }

  libraryList.innerHTML = entries
    .map(
      (entry) => `
        <article class="entry-card">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span class="entry-kind">${formatKind(entry.kind)}</span>
            <span class="page-copy small mb-0">${formatOrder(entry.order)}</span>
          </div>
          <h2 class="entry-title mb-3">${escapeHtml(entry.title)}</h2>
          <p class="entry-summary mb-4">${escapeHtml(entry.summary || "No summary provided yet.")}</p>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <span class="page-copy small mb-0">${escapeHtml(entry.status || "Draft")}</span>
            <a class="btn btn-ink btn-sm" href="reader.html?id=${encodeURIComponent(entry.id)}">
              Open Entry
            </a>
          </div>
        </article>
      `
    )
    .join("");
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
