const DC_SHELL = (() => {
  const pages = [
    { key: "overview", label: "Project Home", href: "index.html" },
    { key: "about", label: "About Divine Chamber", href: "narrative.html" },
    { key: "cast", label: "Chamber Cast", href: "characters.html" },
    { key: "cases", label: "Bureau Cases", href: "cases.html" },
    { key: "archive", label: "Archive", href: "library.html" },
    { key: "world", label: "World & Systems", href: "world.html" },
    { key: "timeline", label: "Timeline", href: "timeline.html" },
    { key: "notes", label: "Notes & Logs", href: "notes.html" },
  ];

  const pageByKey = Object.fromEntries(pages.map((page) => [page.key, page]));

  const navGroups = [
    { label: "Orientation", keys: ["overview", "about"] },
    { label: "Browse", keys: ["cast", "cases", "archive"] },
    { label: "Reference", keys: ["world", "timeline", "notes"] },
  ];

  const contextualLinks = {
    overview: ["about", "cast", "archive"],
    about: ["cases", "world", "archive"],
    cast: ["cases", "archive", "timeline"],
    cases: ["cast", "archive", "world"],
    archive: ["about", "cases", "cast"],
    world: ["archive", "timeline", "cases"],
    timeline: ["archive", "cases", "notes"],
    notes: ["archive", "timeline", "about"],
    reader: ["archive", "cases", "cast"],
  };

  const notes = {
    overview:
      "Start with the premise, then choose whether to enter through character pressure, bureau incidents, or the archive itself.",
    about:
      "This page frames tone and structure. It should orient a new reader before they step into individual files.",
    cast:
      "Cast records work best when they feel legible at a glance and layered on a slower read.",
    cases:
      "Cases are the bureau-facing spine of the archive: incidents first, then the files that orbit them.",
    archive:
      "The archive should reward intentional browsing, not force a reader to decode the whole system at once.",
    world:
      "Reference pages keep the setting coherent without draining the project of atmosphere or dramatic ambiguity.",
    timeline:
      "Chronology should clarify pressure and progression, not turn the archive into a rigid production spreadsheet.",
    notes:
      "Development material stays accessible, but it should remain clearly distinct from canon-facing reading paths.",
    reader:
      "Reader mode should feel calm, readable, and well-connected to the rest of the archive.",
  };

  const body = document.body;
  const currentKey = body.dataset.page || "overview";
  const activeKey = currentKey === "reader" ? "archive" : currentKey;
  const sidebarRoot = document.getElementById("sidebar-shell");
  const mobileRoot = document.getElementById("mobile-shell");

  function renderNavGroups() {
    return navGroups
      .map(
        (group) => `
          <div class="site-nav-group">
            <p class="sidebar-section-label">${group.label}</p>
            <nav class="nav flex-column site-nav">
              ${group.keys
                .map((key) => {
                  const page = pageByKey[key];
                  if (!page) {
                    return "";
                  }

                  const isActive = page.key === activeKey;
                  return `
                    <a class="nav-link${isActive ? " active" : ""}" ${
                      isActive ? 'aria-current="page"' : ""
                    } href="${page.href}">
                      ${page.label}
                    </a>
                  `;
                })
                .join("")}
            </nav>
          </div>
        `
      )
      .join("");
  }

  function renderContextLinks() {
    const keys = contextualLinks[currentKey] || contextualLinks.overview;

    return keys
      .map((key) => {
        const page = pageByKey[key];
        if (!page) {
          return "";
        }

        return `
          <a class="sidebar-mini-link" href="${page.href}">
            <span class="sidebar-mini-link__title">${page.label}</span>
            <span class="sidebar-mini-link__copy">Open ${page.label.toLowerCase()}.</span>
          </a>
        `;
      })
      .join("");
  }

  function renderSidebar() {
    if (!sidebarRoot) {
      return;
    }

    sidebarRoot.innerHTML = `
      <div class="sidebar-panel">
        <div class="sidebar-top">
          <p class="sidebar-kicker mb-2">Private Bureau Archive</p>
          <a class="sidebar-brand" href="index.html">Divine Chamber</a>
          <p class="sidebar-copy mt-3 mb-0">
            An author archive for chamber drama, bureau investigation, symbolic pressure, and long-form story writing.
          </p>
        </div>

        <div class="sidebar-divider"></div>

        <div class="site-nav-shell">
          ${renderNavGroups()}
        </div>

        <div class="sidebar-divider"></div>

        <div class="sidebar-utility">
          <p class="sidebar-section-label">Go Next</p>
          <div class="sidebar-link-list">
            ${renderContextLinks()}
          </div>
        </div>

        <div class="sidebar-note mt-auto">
          ${notes[currentKey] || notes.overview}
        </div>
      </div>
    `;
  }

  function renderMobile() {
    if (!mobileRoot) {
      return;
    }

    mobileRoot.innerHTML = `
      <div class="mobile-topbar d-lg-none">
        <button
          class="btn btn-outline-light btn-sm"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileNav"
          aria-controls="mobileNav"
        >
          Menu
        </button>
        <a class="mobile-brand" href="index.html">Divine Chamber</a>
      </div>

      <div class="offcanvas offcanvas-start mobile-drawer d-lg-none" tabindex="-1" id="mobileNav">
        <div class="offcanvas-header border-bottom">
          <div>
            <p class="drawer-kicker mb-1">Private Bureau Archive</p>
            <h2 class="drawer-title mb-0">Divine Chamber</h2>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="site-nav-shell">
            ${renderNavGroups()}
          </div>
          <div class="sidebar-divider my-4"></div>
          <div class="sidebar-utility">
            <p class="sidebar-section-label">Go Next</p>
            <div class="sidebar-link-list">
              ${renderContextLinks()}
            </div>
          </div>
          <div class="sidebar-note mt-4">
            ${notes[currentKey] || notes.overview}
          </div>
        </div>
      </div>
    `;
  }

  renderSidebar();
  renderMobile();
})();
