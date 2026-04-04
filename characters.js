const characters = [
  {
    id: "kael",
    chip: "KV",
    shortName: "Kael",
    kicker: "Witness",
    name: "Kael Voren",
    role: "Protagonist",
    subtitle: "Scholar, witness, and reluctant interpreter of the chamber.",
    description:
      "Kael treats the chamber as an archive that can still be reasoned with, even after it begins responding like a living witness. His need to understand keeps dragging him toward truths that might not spare him.",
    notes: [
      ["Want", "To uncover why the chamber has awakened."],
      ["Fear", "That revelation will erase the life he built outside it."],
      ["Conflict", "Every answer makes certainty harder to defend."],
    ],
  },
  {
    id: "seris",
    chip: "SV",
    shortName: "Seris",
    kicker: "Counterforce",
    name: "Seris Vale",
    role: "Archivist",
    subtitle: "Custodian of order, discipline, and strategic silence.",
    description:
      "Seris refuses to romanticize the chamber. To her, sanctity is just another form of political armor, and the only ethical response is containment. Her calm is real, but it is also one of the ways she exerts control.",
    notes: [
      ["Want", "To preserve order before fear becomes doctrine."],
      ["Fear", "That memory can be rewritten instead of merely remembered."],
      ["Conflict", "Control keeps pushing her toward betrayal."],
    ],
  },
  {
    id: "mira",
    chip: "MA",
    shortName: "Mira",
    kicker: "Catalyst",
    name: "Mira Ash",
    role: "Performer",
    subtitle: "A director whose rehearsals begin behaving like prophecy.",
    description:
      "Mira senses rhythm where others sense omen. When she stages retellings of the city’s hidden histories, the chamber seems to answer through performance, turning art into contagion and rehearsal into prediction.",
    notes: [
      ["Want", "To turn vision into meaning before others weaponize it."],
      ["Fear", "That she is becoming a vessel rather than an author."],
      ["Conflict", "Every performance reveals more than she intends."],
    ],
  },
  {
    id: "iora",
    chip: "IL",
    shortName: "Iora",
    kicker: "Mediator",
    name: "Iora Leth",
    role: "Translator",
    subtitle: "A linguist who hears pattern inside ritual language and error alike.",
    description:
      "Iora believes the chamber’s responses are structured, not supernatural. She acts as a bridge between scholarship and belief, but the more she decodes the chamber’s grammar, the more personal the grammar becomes.",
    notes: [
      ["Want", "To prove the chamber can be read without being obeyed."],
      ["Fear", "That language itself is already compromised."],
      ["Conflict", "Translation demands intimacy with what she distrusts."],
    ],
  },
  {
    id: "tavian",
    chip: "TH",
    shortName: "Tavian",
    kicker: "Pressure",
    name: "Tavian Holt",
    role: "Civic Envoy",
    subtitle: "A negotiator sent to keep the city calm while truth turns unstable.",
    description:
      "Tavian enters the story as a practical figure: measured, eloquent, and officially temporary. He quickly becomes proof that public order can be just as manipulative as open tyranny.",
    notes: [
      ["Want", "To contain fallout without exposing the city’s weakness."],
      ["Fear", "That the chamber will create a crisis he cannot narrate away."],
      ["Conflict", "Every compromise costs someone else more than him."],
    ],
  },
  {
    id: "eiren",
    chip: "EN",
    shortName: "Eiren",
    kicker: "Memory",
    name: "Eiren Nox",
    role: "Former Keeper",
    subtitle: "An exile carrying fragments of ceremonial knowledge no one fully trusts.",
    description:
      "Eiren knows how the older rites were meant to sound, but never tells the whole truth at once. Their presence makes the chamber feel less like a mystery and more like an inheritance gone feral.",
    notes: [
      ["Want", "To keep the chamber from repeating an older catastrophe."],
      ["Fear", "That confession will implicate them in the first failure."],
      ["Conflict", "Guidance without honesty only deepens suspicion."],
    ],
  },
];

const strip = document.getElementById("character-strip");
const portrait = document.getElementById("character-portrait");
const glyph = document.getElementById("character-glyph");
const role = document.getElementById("character-role");
const kicker = document.getElementById("character-kicker");
const nameNode = document.getElementById("character-name");
const subtitle = document.getElementById("character-subtitle");
const description = document.getElementById("character-description");
const notes = document.getElementById("character-notes");

let activeId = characters[0]?.id ?? null;

if (strip && portrait && glyph && role && kicker && nameNode && subtitle && description && notes) {
  renderStrip();
  renderCharacter(activeId);
}

function renderStrip() {
  strip.innerHTML = "";

  characters.forEach((character) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-chip";
    button.classList.toggle("is-active", character.id === activeId);
    button.setAttribute("aria-pressed", character.id === activeId ? "true" : "false");
    button.innerHTML = `
      <span class="character-chip-face">${character.chip}</span>
      <span class="character-chip-label">${character.shortName}</span>
    `;
    button.addEventListener("click", () => {
      activeId = character.id;
      renderStrip();
      renderCharacter(activeId);
    });
    strip.appendChild(button);
  });
}

function renderCharacter(id) {
  const character = characters.find((item) => item.id === id);
  if (!character) {
    return;
  }

  glyph.textContent = character.chip;
  role.textContent = character.role;
  kicker.textContent = character.kicker;
  nameNode.textContent = character.name;
  subtitle.textContent = character.subtitle;
  description.textContent = character.description;
  notes.innerHTML = character.notes
    .map(
      ([title, copy]) => `
        <div class="note-card">
          <span class="note-title">${title}</span>
          <p class="page-copy mb-0">${copy}</p>
        </div>
      `
    )
    .join("");
}
