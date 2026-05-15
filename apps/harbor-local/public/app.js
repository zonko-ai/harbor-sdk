const state = {
  page: "overview",
  pluginTab: "catalog",
  health: null,
  catalog: [],
  sources: [],
  traces: [],
  query: "",
  category: "all",
  toolQuery: "",
  selectedTool: null,
  toolSchema: null,
  toolInput: "{}",
  toolOutput: null,
  custom: {
    name: "",
    namespace: "",
    endpoint: "",
    auth: "none",
  },
  busy: false,
}

const view = document.querySelector("#view")
const pageTitle = document.querySelector("#page-title")
const notice = document.querySelector("#notice")
const runtimeStatus = document.querySelector("#runtime-status")
const projectRoot = document.querySelector("#project-root")

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function showNotice(message, tone = "info") {
  notice.hidden = false
  notice.className = `notice ${tone === "error" ? "error" : ""}`
  notice.textContent = message
}

function clearNotice() {
  notice.hidden = true
  notice.textContent = ""
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  })
  const payload = await response.json()
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message ?? `Request failed: ${response.status}`)
  }
  return payload.data
}

function setBusy(value) {
  state.busy = value
  document.body.classList.toggle("is-busy", value)
  for (const button of document.querySelectorAll("button")) button.disabled = value
}

function sourceForSlug(slug) {
  return state.sources.find((source) => source.id === slug)
}

function sourceForEntry(entry) {
  return state.sources.find((source) => source.id === entry.defaultNamespace || source.namespace === entry.defaultNamespace)
}

function statusPill(status) {
  const normalized = String(status ?? "unknown")
  const tone = normalized === "ready" || normalized === "not_required"
    ? "ok"
    : normalized.includes("error") || normalized.includes("failed")
      ? "danger"
      : normalized.includes("required") || normalized.includes("pending")
        ? "warn"
        : ""
  return `<span class="pill ${tone}">${escapeHtml(normalized.replaceAll("_", " "))}</span>`
}

function authLabel(entry) {
  if (!entry?.auth) return "none"
  if (entry.auth.mode === "oauth2") return "OAuth"
  if (entry.auth.mode === "bearer") return "Bearer key"
  if (entry.auth.mode === "query") return "Query key"
  return "None"
}

function categoryOptions() {
  const categories = [...new Set(state.catalog.map((entry) => entry.category).filter(Boolean))].sort()
  return ["all", ...categories].map((category) => (
    `<option value="${escapeHtml(category)}" ${state.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`
  )).join("")
}

function filteredCatalog() {
  const query = state.query.trim().toLowerCase()
  return state.catalog
    .filter((entry) => state.category === "all" || entry.category === state.category)
    .filter((entry) => {
      if (!query) return true
      return [
        entry.displayName,
        entry.slug,
        entry.description,
        entry.defaultNamespace,
        entry.category,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    })
    .slice(0, 80)
}

function renderShell() {
  const page = state.page
  pageTitle.textContent = page === "overview" ? "Overview" : page === "plugins" ? "Plugins" : "Traces"
  for (const link of document.querySelectorAll("[data-nav]")) {
    link.classList.toggle("active", link.dataset.nav === page)
  }
  runtimeStatus.textContent = state.health ? "Online" : "Checking"
  runtimeStatus.className = `status-dot ${state.health ? "ok" : "muted"}`
  projectRoot.textContent = state.health?.projectRoot ? `${state.health.projectRoot}/.harbor` : "Project state"
}

function renderOverview() {
  const readySources = state.sources.filter((source) => source.status === "ready").length
  const oauthNeeded = state.sources.filter((source) => source.oauth?.status && source.oauth.status !== "ready" && source.oauth.status !== "not_required").length
  const recent = state.traces.slice(0, 5)
  return `
    <div class="grid cols-3">
      <div class="metric"><strong>${state.sources.length}</strong><span>Installed plugins</span></div>
      <div class="metric"><strong>${readySources}</strong><span>Ready sources</span></div>
      <div class="metric"><strong>${state.traces.length}</strong><span>Recorded traces</span></div>
    </div>
    <div class="grid cols-2">
      <section class="panel">
        <h2>Runtime</h2>
        <div class="grid">
          <p class="meta">Host: <code>${escapeHtml(state.health?.host ?? "unknown")}:${escapeHtml(state.health?.port ?? "")}</code></p>
          <p class="meta">State: <code>${escapeHtml(state.health?.projectRoot ?? "unknown")}/.harbor</code></p>
          <p class="meta">Catalog entries: <code>${state.catalog.length}</code></p>
          <p class="meta">OAuth attention: <code>${oauthNeeded}</code></p>
        </div>
      </section>
      <section class="panel">
        <div class="toolbar">
          <h2>Recent traces</h2>
          <button class="button secondary" type="button" data-go="traces">Open traces</button>
        </div>
        ${recent.length ? recent.map(traceRow).join("") : `<div class="empty">No tool calls recorded yet.</div>`}
      </section>
    </div>
  `
}

function renderPlugins() {
  return `
    <section class="panel">
      <div class="tabs">
        <button class="tab ${state.pluginTab === "catalog" ? "active" : ""}" type="button" data-plugin-tab="catalog">Catalog</button>
        <button class="tab ${state.pluginTab === "installed" ? "active" : ""}" type="button" data-plugin-tab="installed">Installed</button>
        <button class="tab ${state.pluginTab === "tools" ? "active" : ""}" type="button" data-plugin-tab="tools">Tools</button>
      </div>
      ${state.pluginTab === "catalog" ? renderCatalogTab() : state.pluginTab === "installed" ? renderInstalledTab() : renderToolsTab()}
    </section>
  `
}

function renderCatalogTab() {
  const entries = filteredCatalog()
  return `
    <div class="toolbar" style="margin-top: 16px">
      <div class="form-row" style="flex: 1">
        <div class="field grow">
          <label for="catalog-query">Search catalog</label>
          <input id="catalog-query" data-field="query" value="${escapeHtml(state.query)}" placeholder="linear, notion, github">
        </div>
        <div class="field">
          <label for="catalog-category">Category</label>
          <select id="catalog-category" data-field="category">${categoryOptions()}</select>
        </div>
        <button class="button secondary" type="button" data-action="apply-catalog-filter">Apply</button>
      </div>
    </div>
    <details class="panel" style="margin-top: 14px; box-shadow: none">
      <summary><strong>Install custom MCP URL</strong></summary>
      <div class="form-row" style="margin-top: 14px">
        <div class="field grow"><label>Name</label><input data-custom="name" value="${escapeHtml(state.custom.name)}" placeholder="Internal MCP"></div>
        <div class="field"><label>Namespace</label><input data-custom="namespace" value="${escapeHtml(state.custom.namespace)}" placeholder="internal-mcp"></div>
        <div class="field grow"><label>Endpoint</label><input data-custom="endpoint" value="${escapeHtml(state.custom.endpoint)}" placeholder="https://example.com/mcp"></div>
        <div class="field"><label>Auth</label><select data-custom="auth">
          <option value="none" ${state.custom.auth === "none" ? "selected" : ""}>None</option>
          <option value="oauth2" ${state.custom.auth === "oauth2" ? "selected" : ""}>OAuth</option>
        </select></div>
        <button class="button" type="button" data-action="install-custom">Install</button>
      </div>
    </details>
    <div class="plugin-list">
      ${entries.map(catalogRow).join("") || `<div class="empty">No catalog entries match this filter.</div>`}
    </div>
  `
}

function catalogRow(entry) {
  const source = sourceForEntry(entry)
  const selectable = entry.localAvailability?.selectable !== false
  return `
    <article class="plugin-row">
      <div>
        <div class="plugin-title">
          <strong>${escapeHtml(entry.displayName)}</strong>
          <span class="pill">${escapeHtml(entry.category ?? "mcp")}</span>
          <span class="pill">${escapeHtml(authLabel(entry))}</span>
          ${source ? statusPill(source.status) : ""}
        </div>
        <p class="meta">${escapeHtml(entry.description ?? "No description")}</p>
        <p class="meta"><code>${escapeHtml(entry.defaultNamespace)}</code> · ${escapeHtml(entry.endpoint)}</p>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-action="install-catalog" data-slug="${escapeHtml(entry.slug)}" ${!selectable ? "disabled" : ""}>${source ? "Update" : "Install"}</button>
        ${entry.auth?.mode === "oauth2" ? `<button class="button" type="button" data-action="install-connect" data-slug="${escapeHtml(entry.slug)}" ${!selectable ? "disabled" : ""}>Connect</button>` : ""}
      </div>
    </article>
  `
}

function renderInstalledTab() {
  return `
    <div class="plugin-list">
      ${state.sources.map(sourceRow).join("") || `<div class="empty">No plugins installed yet. Install one from the catalog.</div>`}
    </div>
  `
}

function sourceRow(source) {
  const entry = state.catalog.find((candidate) => candidate.defaultNamespace === source.namespace || candidate.slug === source.id)
  const oauthStatus = source.oauth?.status ?? "unknown"
  return `
    <article class="plugin-row">
      <div>
        <div class="plugin-title">
          <strong>${escapeHtml(source.name)}</strong>
          ${statusPill(source.status)}
          ${statusPill(oauthStatus)}
        </div>
        <p class="meta"><code>${escapeHtml(source.namespace)}</code> · ${escapeHtml(source.endpoint ?? source.command ?? "")}</p>
      </div>
      <div class="row-actions">
        ${source.auth?.kind === "oauth2" ? `<button class="button" type="button" data-action="connect-source" data-source-id="${escapeHtml(source.id)}" data-slug="${escapeHtml(entry?.slug ?? "")}">Connect</button>` : ""}
        <button class="button secondary" type="button" data-action="refresh-source" data-source-id="${escapeHtml(source.id)}">Refresh tools</button>
        <button class="button ghost" type="button" data-action="use-source" data-namespace="${escapeHtml(source.namespace)}">Search tools</button>
      </div>
    </article>
  `
}

function renderToolsTab() {
  const hits = state.toolResults ?? []
  return `
    <div class="split" style="margin-top: 16px">
      <section>
        <div class="form-row">
          <div class="field grow">
            <label for="tool-query">Tool search</label>
            <input id="tool-query" data-field="toolQuery" value="${escapeHtml(state.toolQuery)}" placeholder="search issues, fetch page">
          </div>
          <button class="button" type="button" data-action="search-tools">Search</button>
        </div>
        <div class="plugin-list">
          ${hits.map(toolRow).join("") || `<div class="empty">Search installed tools to inspect schemas and call them.</div>`}
        </div>
      </section>
      <section class="panel" style="box-shadow: none">
        <h2>${state.selectedTool ? escapeHtml(state.selectedTool) : "Tool detail"}</h2>
        ${state.toolSchema ? `<pre>${escapeHtml(JSON.stringify(state.toolSchema, null, 2))}</pre>` : `<p class="meta">Select a tool to inspect its schema.</p>`}
        <div class="field" style="margin-top: 14px">
          <label for="tool-input">Input JSON</label>
          <textarea id="tool-input" data-field="toolInput">${escapeHtml(state.toolInput)}</textarea>
        </div>
        <div class="row-actions" style="margin-top: 10px">
          <button class="button" type="button" data-action="invoke-tool" ${state.selectedTool ? "" : "disabled"}>Invoke</button>
        </div>
        ${state.toolOutput ? `<div style="margin-top: 14px"><pre>${escapeHtml(JSON.stringify(state.toolOutput, null, 2))}</pre></div>` : ""}
      </section>
    </div>
  `
}

function toolRow(hit) {
  return `
    <article class="plugin-row">
      <div>
        <div class="plugin-title"><strong>${escapeHtml(hit.toolId)}</strong><span class="pill">${escapeHtml(hit.namespace ?? "tool")}</span></div>
        <p class="meta">${escapeHtml(hit.description ?? "No description")}</p>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-action="select-tool" data-tool-id="${escapeHtml(hit.toolId)}">Schema</button>
      </div>
    </article>
  `
}

function traceRow(trace) {
  return `
    <article class="trace-row">
      <div>
        <div class="plugin-title">
          <strong>${escapeHtml(trace.toolId ?? "unknown tool")}</strong>
          ${statusPill(trace.ok ? "ok" : "failed")}
        </div>
        <p class="meta">${escapeHtml(trace.createdAt ?? trace.startedAt ?? "")} · ${escapeHtml(trace.namespace ?? "")}</p>
      </div>
      <div class="row-actions">
        <button class="button secondary" type="button" data-action="inspect-trace" data-trace-id="${escapeHtml(trace.id ?? "")}">Inspect</button>
      </div>
    </article>
  `
}

function renderTraces() {
  const selected = state.selectedTrace
  return `
    <div class="split">
      <section class="panel">
        <div class="toolbar">
          <h2>Invocation history</h2>
          <button class="button secondary" type="button" data-action="load-traces">Reload</button>
        </div>
        <div class="trace-list">
          ${state.traces.map(traceRow).join("") || `<div class="empty">No traces yet. Invoke an installed tool from Plugins.</div>`}
        </div>
      </section>
      <section class="panel">
        <h2>Trace detail</h2>
        ${selected ? `<pre>${escapeHtml(JSON.stringify(selected, null, 2))}</pre>` : `<p class="meta">Select a trace to inspect inputs, outputs, timing, and errors.</p>`}
      </section>
    </div>
  `
}

function render() {
  renderShell()
  if (state.page === "plugins") view.innerHTML = renderPlugins()
  else if (state.page === "traces") view.innerHTML = renderTraces()
  else view.innerHTML = renderOverview()
}

async function loadAll() {
  clearNotice()
  try {
    const [health, catalog, sources, traces] = await Promise.all([
      api("/health"),
      api("/api/catalog"),
      api("/api/sources"),
      api("/api/invocations?limit=50"),
    ])
    state.health = health
    state.catalog = catalog.entries ?? []
    state.sources = sources.sources ?? []
    state.traces = traces.invocations ?? []
  } catch (error) {
    showNotice(error.message, "error")
  }
  render()
}

async function withAction(fn) {
  setBusy(true)
  clearNotice()
  try {
    await fn()
  } catch (error) {
    showNotice(error.message, "error")
  } finally {
    setBusy(false)
    render()
  }
}

async function installCatalog(slug, connect) {
  const data = await api("/api/sources/install", {
    method: "POST",
    body: JSON.stringify({ slug, connect }),
  })
  if (data.oauth?.authorizationUrl) {
    window.open(data.oauth.authorizationUrl, "_blank", "noopener,noreferrer")
    showNotice(`Opened OAuth for ${data.oauth.sourceId}. Return here and refresh after approval.`)
  } else {
    showNotice(`Installed ${data.source.id}.`)
  }
  await loadAll()
}

async function installCustom() {
  const data = await api("/api/sources/install", {
    method: "POST",
    body: JSON.stringify(state.custom),
  })
  showNotice(`Installed ${data.source.id}.`)
  await loadAll()
}

async function connectSource(sourceId, slug) {
  const body = slug ? { sourceId, slug } : { sourceId }
  const data = await api("/api/sources/connect", {
    method: "POST",
    body: JSON.stringify(body),
  })
  window.open(data.authorizationUrl, "_blank", "noopener,noreferrer")
  showNotice(`Opened OAuth for ${sourceId}. Return here and refresh after approval.`)
}

async function refreshSource(sourceId) {
  const data = await api("/api/sources/refresh", {
    method: "POST",
    body: JSON.stringify({ sourceId }),
  })
  showNotice(`Refreshed ${sourceId}: ${data.toolCount ?? 0} tools indexed.`)
  await loadAll()
}

async function searchTools() {
  const data = await api("/api/tools/search", {
    method: "POST",
    body: JSON.stringify({ query: state.toolQuery, limit: 30 }),
  })
  state.toolResults = data.hits ?? []
}

async function selectTool(toolId) {
  const schema = await api("/api/tools/schema", {
    method: "POST",
    body: JSON.stringify({ toolId }),
  })
  state.selectedTool = toolId
  state.toolSchema = schema
  state.toolOutput = null
}

async function invokeTool() {
  let input
  try {
    input = JSON.parse(state.toolInput || "{}")
  } catch {
    throw new Error("Input must be valid JSON.")
  }
  state.toolOutput = await api("/api/tools/invoke", {
    method: "POST",
    body: JSON.stringify({ toolId: state.selectedTool, input, confirmWrites: true }),
  })
  const traces = await api("/api/invocations?limit=50")
  state.traces = traces.invocations ?? []
}

function syncPageFromHash() {
  const page = window.location.hash.replace("#", "") || "overview"
  state.page = ["overview", "plugins", "traces"].includes(page) ? page : "overview"
}

document.addEventListener("input", (event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLSelectElement)) return
  if (target.dataset.field) state[target.dataset.field] = target.value
  if (target.dataset.custom) state.custom[target.dataset.custom] = target.value
})

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a")
  if (!target) return
  if (target.dataset.go) {
    window.location.hash = target.dataset.go
    return
  }
  if (target.dataset.pluginTab) {
    state.pluginTab = target.dataset.pluginTab
    render()
    return
  }
  const action = target.dataset.action
  if (!action) return
  event.preventDefault()
  withAction(async () => {
    if (action === "install-catalog") await installCatalog(target.dataset.slug, false)
    if (action === "install-connect") await installCatalog(target.dataset.slug, true)
    if (action === "install-custom") await installCustom()
    if (action === "connect-source") await connectSource(target.dataset.sourceId, target.dataset.slug)
    if (action === "refresh-source") await refreshSource(target.dataset.sourceId)
    if (action === "use-source") {
      state.pluginTab = "tools"
      state.toolQuery = target.dataset.namespace ?? ""
      await searchTools()
    }
    if (action === "search-tools") await searchTools()
    if (action === "select-tool") await selectTool(target.dataset.toolId)
    if (action === "invoke-tool") await invokeTool()
    if (action === "load-traces") await loadAll()
    if (action === "apply-catalog-filter") render()
    if (action === "inspect-trace") {
      state.selectedTrace = state.traces.find((trace) => String(trace.id) === String(target.dataset.traceId))
    }
  })
})

document.querySelector("#refresh-all").addEventListener("click", () => {
  withAction(loadAll)
})

window.addEventListener("hashchange", () => {
  syncPageFromHash()
  render()
})

syncPageFromHash()
loadAll()
