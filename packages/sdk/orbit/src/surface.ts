import type { OrbitAppDetail, OrbitAppSummary } from "./apps"
import type { OrbitJobDetail, OrbitJobSummary, OrbitJobVersionRecord } from "./jobs"

export function orbitAppListRow(app: OrbitAppSummary) {
  return {
    name: app.name,
    status: app.status,
    latest_version: app.latest_version ?? null,
    url: app.url,
    access: app.access,
  }
}

export function orbitAppDetailView(app: OrbitAppDetail) {
  return {
    name: app.name,
    status: app.status,
    latest_version: app.latest_version,
    url: app.url,
    access: app.access,
    routes: app.routes.length,
    jobs: Object.keys(app.jobs).length,
    versions: app.versions.length,
  }
}

export function orbitJobListRow(job: OrbitJobSummary) {
  return {
    name: job.name,
    status: job.status,
    latest_version: job.latest_version ?? null,
    capabilities: job.capabilities,
    kind: job.kind ?? null,
    tags: job.tags ?? [],
  }
}

export function orbitJobDetailView(job: OrbitJobDetail) {
  return {
    name: job.name,
    status: job.status,
    latest_version: job.latest_version,
    capabilities: job.capabilities,
    versions: job.versions.length,
    kind: job.kind ?? null,
    tags: job.tags ?? [],
    has_input_schema: job.input_schema !== null,
    has_output_schema: job.output_schema !== null,
  }
}

export function orbitJobVersionRow(version: OrbitJobVersionRecord) {
  return {
    version: version.version,
    status: version.status,
    lane: version.lane,
    capabilities: version.capabilities,
    created_at: version.created_at,
    error: version.error_message,
  }
}
