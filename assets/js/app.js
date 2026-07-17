import { CATEGORIES, ontologyEntities } from "./data.js";

const state = {
  search: "",
  activeCategories: new Set(CATEGORIES),
  selectedId: ontologyEntities[0]?.id ?? null,
  maxLinkedNodes: 10
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
const timelineBars = document.getElementById("timeline-bars");
const thresholdInput = document.getElementById("transition-threshold");
const thresholdValue = document.getElementById("threshold-value");
const alertsAssigned = document.getElementById("alerts-assigned");
const alertsOpen = document.getElementById("alerts-open");
const entityItemTemplate = document.getElementById("entity-item-template");

bindEvents();
render();

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderCategoryFilters();
    renderEntityList();
    renderSelection();
  });

  thresholdInput.addEventListener("input", (event) => {
    state.maxLinkedNodes = Number(event.target.value);
    thresholdValue.textContent = String(state.maxLinkedNodes);
    renderRelationGraph(entityById.get(state.selectedId));
  });
}

function render() {
  renderHeaderSummary();
  renderTimelineBars();
  renderCategoryFilters();
  renderEntityList();
  renderSelection();
}

function renderHeaderSummary() {
  const totalEntities = ontologyEntities.length;
  const totalRelations = ontologyEntities.reduce((sum, entity) => sum + (entity.relations?.length ?? 0), 0);
  alertsAssigned.textContent = String(totalEntities);
  alertsOpen.textContent = String(totalRelations);
}

function renderTimelineBars() {
  timelineBars.innerHTML = "";
  const values = buildTimelineSeries();
  values.forEach((value) => {
    const bar = document.createElement("div");
    bar.className = "timeline-bar";
    bar.style.height = `${Math.max(value, 8)}%`;
    timelineBars.appendChild(bar);
  });
}

function buildTimelineSeries() {
  const buckets = new Array(20).fill(0);
  ontologyEntities.forEach((entity, index) => {
    const bucket = index % buckets.length;
    buckets[bucket] += (entity.relations?.length ?? 1) + entity.tags.length;
  });
  const max = Math.max(...buckets, 1);
  return buckets.map((value) => (value / max) * 100);
}

function renderCategoryFilters() {
  const counts = countByCategory(getSearchMatchedEntities());
  categoryFilters.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${state.activeCategories.has(category) ? " active" : ""}`;
    button.setAttribute("aria-pressed", String(state.activeCategories.has(category)));
    button.innerHTML = `<span>${escapeHtml(category)}</span><span class="chip-count">${counts.get(category) ?? 0}</span>`;
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

function countByCategory(entities) {
  const counts = new Map(CATEGORIES.map((category) => [category, 0]));
  entities.forEach((entity) => {
    counts.set(entity.category, (counts.get(entity.category) ?? 0) + 1);
  });
  return counts;
}

function getSearchMatchedEntities() {
  return ontologyEntities.filter((entity) => {
    if (!state.search) {
      return true;
    }

    const haystack = [entity.name, entity.summary, ...entity.tags, ...Object.values(entity.attributes)].join(" ").toLowerCase();
    return haystack.includes(state.search);
  });
}

function getFilteredEntities() {
  return getSearchMatchedEntities().filter((entity) => state.activeCategories.has(entity.category));
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

      button.classList.toggle("active", entity.id === state.selectedId);
      button.addEventListener("click", () => {
        state.selectedId = entity.id;
        renderEntityList();
        renderSelection();
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
      <h3>Select an entity</h3>
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
      <h3>${escapeHtml(entity.name)}</h3>
      <span class="category-badge">${escapeHtml(entity.category)}</span>
    </div>
    <p>${escapeHtml(entity.summary)}</p>
    <ul class="meta-list">${metaItems}</ul>
    <div class="tag-wrap">${tags}</div>
  `;
}

function renderRelationLinks(entity) {
  const edges = buildEdges(entity);
  if (edges.length === 0) {
    relationLinks.classList.add("muted");
    relationLinks.innerHTML = "No linked relations for this entity.";
    return;
  }

  relationLinks.classList.remove("muted");
  const list = document.createElement("ul");
  list.className = "relation-list";

  edges.forEach((edge) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    const direction = edge.direction === "outgoing" ? "->" : "<-";
    button.textContent = `${direction} ${edge.relationType} ${edge.other.name} (${edge.other.category})`;
    button.addEventListener("click", () => {
      state.selectedId = edge.other.id;
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
  const width = relationGraph.clientWidth || 1000;
  const height = relationGraph.clientHeight || 510;
  relationGraph.setAttribute("viewBox", `0 0 ${width} ${height}`);
  relationGraph.innerHTML = "";

  if (!entity) {
    return;
  }

  const edges = dedupeGraphEdges(buildEdges(entity)).slice(0, state.maxLinkedNodes);
  if (edges.length === 0) {
    appendSvgText(relationGraph, width / 2, height / 2, "No linked entities for current selection", "#657489", 16);
    return;
  }

  function dedupeGraphEdges(edges) {
    const byOther = new Map();
    edges.forEach((edge) => {
      const key = edge.other.id;
      const existing = byOther.get(key);
      if (!existing) {
        byOther.set(key, edge);
        return;
      }
      if (existing.direction !== "outgoing" && edge.direction === "outgoing") {
        byOther.set(key, edge);
      }
    });
    return Array.from(byOther.values()).sort((a, b) => a.other.name.localeCompare(b.other.name));
  }

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.33;

  const nodes = edges.map((edge, index) => {
    const angle = (index / edges.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: edge.other.id,
      entity: edge.other,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      relationType: edge.relationType,
      direction: edge.direction
    };
  });

  nodes.forEach((node) => {
    appendLink(relationGraph, center, node, node.direction);
    appendSvgText(
      relationGraph,
      (center.x + node.x) / 2,
      (center.y + node.y) / 2 - 8,
      node.relationType,
      "#5d6f86",
      11
    );
  });

  nodes.forEach((node) => appendNodeCircle(relationGraph, node, 34, false));
  appendNodeCircle(
    relationGraph,
    { id: entity.id, entity, x: center.x, y: center.y, direction: "selected" },
    42,
    true
  );
}

function appendLink(svg, source, targetNode, direction) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(source.x));
  line.setAttribute("y1", String(source.y));
  line.setAttribute("x2", String(targetNode.x));
  line.setAttribute("y2", String(targetNode.y));
  line.setAttribute("stroke", direction === "outgoing" ? "#2f5ea7" : "#7b8898");
  line.setAttribute("stroke-width", "2.1");
  line.setAttribute("opacity", "0.8");
  svg.appendChild(line);
}

function appendNodeCircle(svg, node, radius, selected) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.style.cursor = "pointer";
  group.setAttribute("role", "button");
  group.setAttribute("tabindex", "0");
  group.setAttribute("aria-label", `${node.entity.name} (${node.entity.category})`);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", String(node.x));
  circle.setAttribute("cy", String(node.y));
  circle.setAttribute("r", String(radius));
  circle.setAttribute("fill", selected ? "#1f5ec6" : "#f5f8ff");
  circle.setAttribute("stroke", selected ? "#1a3f84" : "#90a8ce");
  circle.setAttribute("stroke-width", selected ? "3" : "2");
  group.appendChild(circle);

  appendSvgText(group, node.x, node.y - 3, shorten(node.entity.name, 20), selected ? "#ffffff" : "#20344f", 11, true);
  appendSvgText(group, node.x, node.y + 13, node.entity.category, selected ? "#dce9ff" : "#4d6180", 10, false);

  group.addEventListener("click", () => {
    state.selectedId = node.entity.id;
    renderEntityList();
    renderSelection();
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      state.selectedId = node.entity.id;
      renderEntityList();
      renderSelection();
    }
  });

  svg.appendChild(group);
}

function appendSvgText(target, x, y, text, color, fontSize, bold = false) {
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", String(x));
  label.setAttribute("y", String(y));
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("fill", color);
  label.setAttribute("font-size", String(fontSize));
  if (bold) {
    label.setAttribute("font-weight", "700");
  }
  label.textContent = text;
  target.appendChild(label);
}

function buildEdges(entity) {
  const outgoing = (entity.relations ?? []).map((relation) => ({
    direction: "outgoing",
    relationType: relation.type,
    other: entityById.get(relation.target)
  }));

  const incoming = (incomingRelations.get(entity.id) ?? []).map((relation) => ({
    direction: "incoming",
    relationType: relation.type,
    other: entityById.get(relation.source)
  }));

  return [...outgoing, ...incoming]
    .filter((edge) => edge.other)
    .sort((a, b) => a.other.name.localeCompare(b.other.name));
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

function toLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function shorten(value, maxLength) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
