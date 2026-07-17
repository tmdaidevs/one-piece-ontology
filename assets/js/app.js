import { CATEGORIES, ontologyEntities } from "./data.js";

const state = {
  search: "",
  activeCategories: new Set(CATEGORIES),
  selectedId: ontologyEntities[0]?.id ?? null,
  threshold: 35
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
    renderEntityList();
    renderSelection();
  });

  thresholdInput.addEventListener("input", (event) => {
    state.threshold = Number(event.target.value);
    thresholdValue.textContent = String(state.threshold);
    renderSelection();
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
  alertsAssigned.textContent = String(totalEntities * 7 + 14);
  alertsOpen.textContent = String(totalRelations + totalEntities);
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
    const dirLabel = edge.direction === "outgoing" ? "->" : "<-";
    button.textContent = `${dirLabel} ${edge.relationType} ${edge.other.name} (${edge.other.category})`;
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
  const edges = buildEdges(entity);
  const ranked = rankEdges(edges).filter((edge) => edge.weight >= state.threshold / 100);
  const pruned = ranked.slice(0, 10);
  const width = relationGraph.clientWidth || 1000;
  const height = relationGraph.clientHeight || 510;

  relationGraph.setAttribute("viewBox", `0 0 ${width} ${height}`);
  relationGraph.innerHTML = "";

  if (pruned.length === 0) {
    appendSvgText(relationGraph, width / 2, height / 2, "No transitions above current threshold", "#657489", 16);
    return;
  }

  const boxWidth = 200;
  const boxHeight = 64;
  const marginX = 46;
  const marginY = 42;

  const selectedNode = {
    id: entity.id,
    x: width * 0.5,
    y: height * 0.5,
    kind: "selected",
    entity
  };

  const outgoing = pruned.filter((edge) => edge.direction === "outgoing");
  const incoming = pruned.filter((edge) => edge.direction === "incoming");

  const outgoingNodes = distributeFlowNodes(outgoing, "outgoing", width, height, marginX, marginY, boxWidth, boxHeight);
  const incomingNodes = distributeFlowNodes(incoming, "incoming", width, height, marginX, marginY, boxWidth, boxHeight);
  const nodes = dedupeNodes([selectedNode, ...incomingNodes, ...outgoingNodes]);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  pruned.forEach((edge) => {
    const sourceNode = edge.direction === "outgoing" ? nodeById.get(entity.id) : nodeById.get(edge.other.id);
    const targetNode = edge.direction === "outgoing" ? nodeById.get(edge.other.id) : nodeById.get(entity.id);
    if (sourceNode && targetNode) {
      appendCurvedEdge(relationGraph, sourceNode, targetNode, edge);
    }
  });

  nodes.forEach((node) => appendRectNode(relationGraph, node, boxWidth, boxHeight));
}

function distributeFlowNodes(edges, kind, width, height, marginX, marginY, boxWidth, boxHeight) {
  return edges.map((edge, index) => {
    const rows = Math.ceil(edges.length / 2);
    const row = index % rows;
    const col = Math.floor(index / rows);
    const laneX = kind === "outgoing"
      ? width * (0.7 + col * 0.2)
      : width * (0.18 - col * 0.14);
    const laneY = marginY + row * ((height - marginY * 2) / Math.max(1, rows - 1));

    return {
      id: edge.other.id,
      x: clamp(laneX, marginX + boxWidth / 2, width - marginX - boxWidth / 2),
      y: clamp(laneY, marginY + boxHeight / 2, height - marginY - boxHeight / 2),
      kind,
      entity: edge.other
    };
  });
}

function appendCurvedEdge(svg, sourceNode, targetNode, edge) {
  const sourceX = sourceNode.x;
  const sourceY = sourceNode.y;
  const targetX = targetNode.x;
  const targetY = targetNode.y;
  const controlX = (sourceX + targetX) / 2;
  const controlY = sourceY < targetY ? sourceY + 40 : sourceY - 40;
  const color = edge.direction === "outgoing" ? "#0e7a43" : "#7a8797";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", String(1.4 + edge.weight * 2.2));
  path.setAttribute("stroke-dasharray", "4 5");
  path.setAttribute("opacity", "0.82");
  svg.appendChild(path);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", String((sourceX + targetX) / 2));
  label.setAttribute("y", String((sourceY + targetY) / 2 - 6));
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("fill", "#4b5b6f");
  label.setAttribute("font-size", "11");
  label.textContent = `${Math.round(edge.weight * 100)}%`;
  svg.appendChild(label);
}

function appendRectNode(svg, node, width, height) {
  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.style.cursor = "pointer";
  nodeGroup.setAttribute("role", "button");
  nodeGroup.setAttribute("tabindex", "0");
  nodeGroup.setAttribute("aria-label", `${node.entity.name} (${node.entity.category})`);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", String(node.x - width / 2));
  rect.setAttribute("y", String(node.y - height / 2));
  rect.setAttribute("width", String(width));
  rect.setAttribute("height", String(height));
  rect.setAttribute("rx", "8");
  rect.setAttribute("fill", "#ffffff");
  rect.setAttribute("stroke", "#b8c1cc");
  rect.setAttribute("stroke-width", "1.5");
  nodeGroup.appendChild(rect);

  const accent = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  accent.setAttribute("x", String(node.x - width / 2));
  accent.setAttribute("y", String(node.y - height / 2));
  accent.setAttribute("width", String(width));
  accent.setAttribute("height", "8");
  accent.setAttribute("rx", "8");
  accent.setAttribute("fill", node.kind === "selected" ? "#b22e2e" : node.kind === "outgoing" ? "#0e7a43" : "#576981");
  nodeGroup.appendChild(accent);

  appendSvgText(nodeGroup, node.x - width / 2 + 10, node.y - 10, shorten(node.entity.name, 24), "#182131", 12, "start", true);
  appendSvgText(
    nodeGroup,
    node.x - width / 2 + 10,
    node.y + 10,
    `${node.entity.category} | ${(node.entity.relations ?? []).length} transitions`,
    "#4d5d72",
    11,
    "start"
  );

  nodeGroup.addEventListener("click", () => {
    state.selectedId = node.entity.id;
    renderEntityList();
    renderSelection();
  });
  nodeGroup.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      state.selectedId = node.entity.id;
      renderEntityList();
      renderSelection();
    }
  });

  svg.appendChild(nodeGroup);
}

function appendSvgText(target, x, y, textContent, color, size, anchor = "middle", strong = false) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(x));
  text.setAttribute("y", String(y));
  text.setAttribute("text-anchor", anchor);
  text.setAttribute("fill", color);
  text.setAttribute("font-size", String(size));
  if (strong) {
    text.setAttribute("font-weight", "700");
  }
  text.textContent = textContent;
  target.appendChild(text);
}

function buildEdges(entity) {
  const outgoing = (entity.relations ?? []).map((relation) => ({
    direction: "outgoing",
    relationType: relation.type,
    source: entity.id,
    target: relation.target,
    other: entityById.get(relation.target)
  }));

  const incoming = (incomingRelations.get(entity.id) ?? []).map((relation) => ({
    direction: "incoming",
    relationType: relation.type,
    source: relation.source,
    target: entity.id,
    other: entityById.get(relation.source)
  }));

  return [...outgoing, ...incoming].filter((edge) => edge.other);
}

function rankEdges(edges) {
  const max = Math.max(edges.length, 1);
  return edges
    .map((edge) => {
      const hash = hashString(`${edge.source}:${edge.relationType}:${edge.target}`);
      const score = 0.12 + ((hash % 89) / 100);
      return { ...edge, weight: Math.min(1, score) };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, max);
}

function dedupeNodes(nodes) {
  const byId = new Map();
  nodes.forEach((node) => {
    if (!byId.has(node.id)) {
      byId.set(node.id, node);
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function shorten(value, max) {
      return value.length <= max ? value : `${value.slice(0, max - 1)}...`;
    }
  });
  return Array.from(byId.values());
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

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
