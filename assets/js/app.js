import { CATEGORIES, ontologyEntities } from "./data.js";

const state = {
  search: "",
  activeCategories: new Set(CATEGORIES),
  selectedId: ontologyEntities[0]?.id ?? null
};

const entityById = new Map(ontologyEntities.map((entity) => [entity.id, entity]));
const incomingRelations = buildIncomingRelations(ontologyEntities);

const searchInput = document.getElementById("search-input");
const categoryFilters = document.getElementById("category-filters");
const resultCount = document.getElementById("result-count");
const entityList = document.getElementById("entity-list");
const entityDetails = document.getElementById("entity-details");
const relationLinks = document.getElementById("relation-links");
const relationGraph = document.getElementById("relation-graph");
const entityItemTemplate = document.getElementById("entity-item-template");

bindEvents();
render();

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderEntityList();
    renderSelection();
  });
}

function render() {
  renderCategoryFilters();
  renderEntityList();
  renderSelection();
}

function renderCategoryFilters() {
  categoryFilters.innerHTML = "";
  CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${state.activeCategories.has(category) ? " active" : ""}`;
    button.textContent = category;
    button.setAttribute("aria-pressed", state.activeCategories.has(category));
    button.addEventListener("click", () => {
      if (state.activeCategories.has(category)) {
        state.activeCategories.delete(category);
      } else {
        state.activeCategories.add(category);
      }

      if (state.activeCategories.size === 0) {
        CATEGORIES.forEach((item) => state.activeCategories.add(item));
      }

      renderCategoryFilters();
      renderEntityList();
      renderSelection();
    });
    categoryFilters.appendChild(button);
  });
}

function getFilteredEntities() {
  return ontologyEntities.filter((entity) => {
    if (!state.activeCategories.has(entity.category)) {
      return false;
    }

    if (!state.search) {
      return true;
    }

    const haystack = [
      entity.name,
      entity.summary,
      ...entity.tags,
      ...Object.values(entity.attributes)
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(state.search);
  });
}

function renderEntityList() {
  const filtered = getFilteredEntities();
  resultCount.textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;
  entityList.innerHTML = "";

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No entities match this search/filter combination.";
    entityList.appendChild(li);
    return;
  }

  if (!filtered.some((entity) => entity.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
  }

  filtered
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((entity) => {
      const fragment = entityItemTemplate.content.cloneNode(true);
      const button = fragment.querySelector(".entity-item");
      const name = fragment.querySelector(".entity-name");
      const category = fragment.querySelector(".entity-category");
      button.dataset.id = entity.id;
      button.classList.toggle("active", entity.id === state.selectedId);
      button.addEventListener("click", () => {
        state.selectedId = entity.id;
        renderSelection();
        renderEntityList();
      });
      name.textContent = entity.name;
      category.textContent = entity.category;
      entityList.appendChild(fragment);
    });
}

function renderSelection() {
  const entity = entityById.get(state.selectedId);

  if (!entity) {
    entityDetails.innerHTML = `
      <h2>Select an entity</h2>
      <p class="muted">Choose an item from the list to inspect details and relationships.</p>
    `;
    relationLinks.innerHTML = "No entity selected.";
    relationLinks.classList.add("muted");
    relationGraph.innerHTML = "";
    return;
  }

  renderDetails(entity);
  renderRelationLinks(entity);
  renderRelationGraph(entity);
}

function renderDetails(entity) {
  const entries = Object.entries(entity.attributes);
  const metaItems = entries
    .map(([key, value]) => `<li><strong>${toLabel(key)}:</strong> ${escapeHtml(String(value))}</li>`)
    .join("");
  const tags = entity.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  entityDetails.innerHTML = `
    <div class="details-header">
      <h2>${escapeHtml(entity.name)}</h2>
      <span class="category-badge">${escapeHtml(entity.category)}</span>
    </div>
    <p>${escapeHtml(entity.summary)}</p>
    <ul class="meta-list">${metaItems}</ul>
    <div class="tag-wrap">${tags}</div>
  `;
}

function renderRelationLinks(entity) {
  const outgoing = (entity.relations ?? []).map((relation) => ({
    direction: "outgoing",
    relationType: relation.type,
    source: entity.id,
    target: relation.target
  }));
  const incoming = (incomingRelations.get(entity.id) ?? []).map((relation) => ({
    direction: "incoming",
    relationType: relation.type,
    source: relation.source,
    target: entity.id
  }));
  const combined = [...outgoing, ...incoming];

  if (combined.length === 0) {
    relationLinks.classList.add("muted");
    relationLinks.innerHTML = "No linked relations for this entity.";
    return;
  }

  relationLinks.classList.remove("muted");
  const list = document.createElement("ul");
  list.className = "relation-list";

  combined.forEach((edge) => {
    const otherId = edge.direction === "outgoing" ? edge.target : edge.source;
    const other = entityById.get(otherId);
    if (!other) {
      return;
    }

    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    const dirLabel = edge.direction === "outgoing" ? "->" : "<-";
    button.textContent = `${dirLabel} ${edge.relationType} ${other.name} (${other.category})`;
    button.addEventListener("click", () => {
      state.selectedId = other.id;
      renderEntityList();
      renderSelection();
    });
    li.appendChild(button);
    list.appendChild(li);
  });

  relationLinks.innerHTML = "";
  relationLinks.appendChild(list);
}

function renderRelationGraph(entity) {
  const width = relationGraph.clientWidth || 800;
  const height = relationGraph.clientHeight || 420;
  relationGraph.setAttribute("viewBox", `0 0 ${width} ${height}`);
  relationGraph.innerHTML = "";

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.33;

  const linkedMap = new Map();

  for (const relation of entity.relations ?? []) {
    const target = entityById.get(relation.target);
    if (!target || target.id === entity.id) {
      continue;
    }
    linkedMap.set(target.id, { id: target.id, name: target.name, category: target.category, type: relation.type });
  }

  for (const incoming of incomingRelations.get(entity.id) ?? []) {
    const source = entityById.get(incoming.source);
    if (!source || source.id === entity.id) {
      continue;
    }
    if (!linkedMap.has(source.id)) {
      linkedMap.set(source.id, { id: source.id, name: source.name, category: source.category, type: incoming.type });
    }
  }

  const linked = Array.from(linkedMap.values()).slice(0, 12);

  if (linked.length === 0) {
    return;
  }

  linked.forEach((node, index) => {
    const angle = (index / linked.length) * Math.PI * 2;
    const point = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };

    appendLine(relationGraph, center.x, center.y, point.x, point.y);
    appendCircleNode(relationGraph, point.x, point.y, 30, node.name, node.category, () => {
      state.selectedId = node.id;
      renderEntityList();
      renderSelection();
    });
    appendText(relationGraph, point.x, point.y + 46, shortName(node.name));
  });

  appendCircleNode(relationGraph, center.x, center.y, 40, entity.name, entity.category, null, true);
  appendText(relationGraph, center.x, center.y + 57, shortName(entity.name));
}

function appendLine(svg, x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "#3f5a88");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);
}

function appendCircleNode(svg, x, y, r, name, category, onClick, isCenter = false) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", r);
  circle.setAttribute("fill", isCenter ? "#2f6cc2" : "#22406f");
  circle.setAttribute("stroke", isCenter ? "#9fcbff" : "#72a9ff");
  circle.setAttribute("stroke-width", isCenter ? "3" : "2");
  circle.setAttribute("role", "button");
  circle.setAttribute("tabindex", onClick ? "0" : "-1");
  circle.setAttribute("aria-label", `${name} (${category})`);

  if (onClick) {
    circle.style.cursor = "pointer";
    circle.addEventListener("click", onClick);
    circle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    });
  }

  svg.appendChild(circle);
}

function appendText(svg, x, y, label) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#d7e8ff");
  text.setAttribute("font-size", "12");
  text.textContent = label;
  svg.appendChild(text);
}

function buildIncomingRelations(entities) {
  const index = new Map();
  entities.forEach((entity) => {
    (entity.relations ?? []).forEach((relation) => {
      if (!index.has(relation.target)) {
        index.set(relation.target, []);
      }
      index.get(relation.target).push({ source: entity.id, type: relation.type });
    });
  });
  return index;
}

function shortName(name) {
  return name.length > 20 ? `${name.slice(0, 19)}...` : name;
}

function toLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
