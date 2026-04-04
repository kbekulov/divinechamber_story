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

  const notes = {
    overview:
      "The archive is organized to preserve both faces of the project: interior chamber drama and exterior bureau procedure.",
    about:
      "Use this page to frame tone, premise, themes, and the chamber-bureau split before a reader enters the files themselves.",
    cast:
      "Cast records read as interpretive dossiers rather than generic fantasy bios. Each presence should feel alive, dangerous, and dramatically precise.",
    cases:
      "Cases belong to the bureau, but the chamber keeps altering what the bureau thinks a case is.",
    archive:
      "Browse across files intentionally: by type, facet, character, case, and status rather than a flat chronological dump.",
    world:
      "World entries keep the city, Crown, bureau, and symbolic systems readable without draining them of atmosphere.",
    timeline:
      "Chronology is a working archive tool. It should reveal pressure, escalation, and recurrence without pretending the project is mechanically closed.",
    notes:
      "Notes and dev logs remain part of the project’s living archive, but they are clearly separated from canon-facing material.",
    reader:
      "Reader mode treats each file as a real archive object, with context, relations, and room for long-form prose.",
  };

  const body = document.body;
  const currentKey = body.dataset.page || "overview";
  const activeKey = currentKey === "reader" ? "archive" : currentKey;
  const sidebarRoot = document.getElementById("sidebar-shell");
  const mobileRoot = document.getElementById("mobile-shell");

  function navMarkup() {
    return pages
      .map((page) => {
        const isActive = page.key === activeKey;
        return `
          <a class="nav-link${isActive ? " active" : ""}" ${
            isActive ? 'aria-current="page"' : ""
          } href="${page.href}">
            ${page.label}
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
          <p class="sidebar-copy mt-3 mb-4">
            An author archive for chamber drama, symbolic pressure, and city-level investigations.
          </p>
        </div>

        <div class="sidebar-facet-card">
          <p class="card-kicker">Dual Facet</p>
          <div class="facet-mini-grid">
            <div>
              <strong>Chamber</strong>
              <span>Theatrical, intimate, archetypal, dangerous.</span>
            </div>
            <div>
              <strong>Bureau</strong>
              <span>Investigative, political, procedural, urban.</span>
            </div>
          </div>
        </div>

        <nav class="nav flex-column site-nav mt-4">
          ${navMarkup()}
        </nav>

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
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <nav class="nav flex-column site-nav">
            ${navMarkup()}
          </nav>
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
