const facetFilters = document.getElementById("archive-facet-filters");
const typeSelect = document.getElementById("archive-type");
const statusSelect = document.getElementById("archive-status");
const characterSelect = document.getElementById("archive-character");
const caseSelect = document.getElementById("archive-case");
const archiveCount = document.getElementById("archive-count");
const archiveList = document.getElementById("library-list");

const archiveState = {
  entries: [],
  facet: "all",
  type: "all",
  status: "all",
  character: "all",
  case: "all",
};

if (facetFilters && typeSelect && statusSelect && characterSelect && caseSelect && archiveCount && archiveList) {
  initializeArchive();
}

async function initializeArchive() {
  const manifest = await window.DivineChamber.fetchManifest();
  archiveState.entries = manifest.entries;

  const params = new URLSearchParams(window.location.search);
  archiveState.facet = params.get("facet") || "all";
  archiveState.type = params.get("type") || "all";
  archiveState.status = params.get("status") || "all";
  archiveState.character = params.get("character") || "all";
  archiveState.case = params.get("case") || "all";

  populateFacetFilters(manifest.collections.facets);
  populateSelect(typeSelect, "All Types", manifest.collections.types, window.DivineChamber.formatType, archiveState.type);
  populateSelect(statusSelect, "All Statuses", manifest.collections.statuses, window.DivineChamber.formatStatus, archiveState.status);
  populateSelect(characterSelect, "All Characters", manifest.collections.characters, (value) => value, archiveState.character);
  populateSelect(
    caseSelect,
    "All Cases",
    manifest.collections.cases,
    (value) => archiveState.entries.find((entry) => entry.case === value)?.case_name || window.DivineChamber.sentenceCase(value),
    archiveState.case
  );

  wireArchiveControls();
  renderArchive();
}

function populateFacetFilters(facets) {
  facetFilters.innerHTML = ["all", ...facets]
    .map((facet) => {
      const isActive = archiveState.facet === facet;
      const label = facet === "all" ? "All Facets" : window.DivineChamber.formatFacet(facet);
      return `
        <button class="btn ${isActive ? "btn-brass" : "btn-outline-light"} filter-chip" type="button" data-facet="${facet}">
          ${label}
        </button>
      `;
    })
    .join("");
}

function populateSelect(select, allLabel, values, formatter, currentValue) {
  select.innerHTML = [`<option value="all">${allLabel}</option>`]
    .concat(
      values.map(
        (value) =>
          `<option value="${window.DivineChamber.escapeHtml(value)}" ${
            value === currentValue ? "selected" : ""
          }>${window.DivineChamber.escapeHtml(formatter(value))}</option>`
      )
    )
    .join("");
}

function wireArchiveControls() {
  facetFilters.querySelectorAll("[data-facet]").forEach((button) => {
    button.addEventListener("click", () => {
      archiveState.facet = button.dataset.facet;
      populateFacetFilters([...new Set(archiveState.entries.map((entry) => entry.facet))]);
      renderArchive();
    });
  });

  typeSelect.addEventListener("change", () => {
    archiveState.type = typeSelect.value;
    renderArchive();
  });

  statusSelect.addEventListener("change", () => {
    archiveState.status = statusSelect.value;
    renderArchive();
  });

  characterSelect.addEventListener("change", () => {
    archiveState.character = characterSelect.value;
    renderArchive();
  });

  caseSelect.addEventListener("change", () => {
    archiveState.case = caseSelect.value;
    renderArchive();
  });
}

function getFilteredEntries() {
  return archiveState.entries.filter((entry) => {
    if (archiveState.facet !== "all" && entry.facet !== archiveState.facet) {
      return false;
    }
    if (archiveState.type !== "all" && entry.type !== archiveState.type) {
      return false;
    }
    if (archiveState.status !== "all" && entry.status !== archiveState.status) {
      return false;
    }
    if (
      archiveState.character !== "all" &&
      !(entry.characters || []).includes(archiveState.character)
    ) {
      return false;
    }
    if (archiveState.case !== "all" && entry.case !== archiveState.case) {
      return false;
    }

    return true;
  });
}

function renderArchive() {
  const filtered = window.DivineChamber.byChronology(getFilteredEntries());
  archiveCount.innerHTML = `
    <span class="archive-result-line__count">${filtered.length}</span>
    <span class="archive-result-line__label">matching files in the archive</span>
  `;

  archiveList.innerHTML = filtered.length
    ? filtered
        .map((entry) =>
          window.DivineChamber.renderEntryCard(entry, {
            buttonLabel: "Open File",
          })
        )
        .join("")
    : `<div class="empty-card">No archive files match the current filters.</div>`;
}
