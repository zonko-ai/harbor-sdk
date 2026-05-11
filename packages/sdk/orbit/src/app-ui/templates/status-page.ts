import { Card, Hero, ItemList, Page, Section, Stack, html, raw, response } from '../index'

export interface StatusPageConfig {
  readonly title: string
  readonly description?: string | undefined
  readonly eyebrow?: string | undefined
  readonly entriesField?: string | undefined
  readonly emptyLabel?: string | undefined
  readonly sections: readonly StatusSectionConfig[]
}

export interface StatusSectionConfig {
  readonly key: string
  readonly title: string
  readonly description?: string | undefined
  readonly emptyLabel?: string | undefined
}

export interface StatusEntry {
  readonly title?: string | undefined
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly summary?: string | undefined
  readonly status?: string | undefined
  readonly href?: string | undefined
  readonly timestamp?: string | undefined
  readonly updated_at?: string | undefined
  readonly meta?: Record<string, unknown> | undefined
}

export interface StatusPageTemplateOptions {
  readonly config: StatusPageConfig
  readonly jobs: { readonly list: string }
}

export interface StatusPageRoute {
  readonly method: 'GET'
  readonly path: '/'
  readonly job: string
  readonly render: (result: unknown) => { html: string; status?: number; headers?: Record<string, string> }
}

export function statusPageTemplate(opts: StatusPageTemplateOptions): {
  readonly kind: 'orbit-app-template'
  readonly template: 'status-page'
  readonly jobs: { readonly list: string }
  readonly routes: readonly [StatusPageRoute]
} {
  return {
    kind: 'orbit-app-template',
    template: 'status-page',
    jobs: opts.jobs,
    routes: [{
      method: 'GET',
      path: '/',
      job: opts.jobs.list,
      render: (result: unknown) => response(renderStatusPage(opts.config, result), {
        title: opts.config.title,
        description: opts.config.description,
      }),
    }],
  }
}

function renderStatusPage(config: StatusPageConfig, result: unknown) {
  const entries = entriesBySection(config, result)

  return Page({
    title: config.title,
    description: config.description,
    eyebrow: config.eyebrow,
    maxWidth: 'lg',
  }, [
    Hero({
      eyebrow: config.eyebrow,
      title: config.title,
      description: config.description,
    }),
    Stack({ gap: 'lg' }, config.sections.map((section) => {
      const items = entries[section.key] ?? []
      return Section({
        title: section.title,
        description: section.description,
        action: html`<span class="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground-muted">${items.length} ${items.length === 1 ? 'entry' : 'entries'}</span>`,
      }, [
        ItemList<StatusEntry>({
          items,
          tag: 'div',
          gap: 'sm',
          empty: html`<span>${section.emptyLabel ?? config.emptyLabel ?? 'Nothing to show right now.'}</span>`,
          render: (entry) => renderStatusEntry(entry),
        }),
      ])
    })),
  ])
}

function entriesBySection(config: StatusPageConfig, result: unknown): Record<string, readonly StatusEntry[]> {
  const root = asRecord(result)
  const container = config.entriesField && config.entriesField !== '.'
    ? asRecord(root[config.entriesField])
    : root

  const out: Record<string, readonly StatusEntry[]> = {}
  for (const section of config.sections) {
    out[section.key] = asEntries(container[section.key])
  }
  return out
}

function renderStatusEntry(entry: StatusEntry) {
  const title = entry.title ?? entry.name ?? 'Untitled entry'
  const description = entry.description ?? entry.summary
  const timestamp = entry.timestamp ?? entry.updated_at
  const status = entry.status ?? 'status'
  const meta = entry.meta ? Object.entries(entry.meta).slice(0, 3) : []

  return Card({ padding: 'md' }, [
    html`<article class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          ${statusBadge(status)}
          ${timestamp ? html`<span class="text-xs text-foreground-soft">${formatTimestamp(timestamp)}</span>` : ''}
        </div>
        <h3 class="text-base font-medium tracking-tight text-foreground">
          ${entry.href ? html`<a class="underline-offset-4 hover:underline" href="${entry.href}">${title}</a>` : title}
        </h3>
        ${description ? html`<p class="text-sm leading-6 text-foreground-muted">${description}</p>` : ''}
        ${meta.length > 0 ? renderMeta(meta) : ''}
      </div>
    </article>`,
  ])
}

function renderMeta(meta: readonly [string, unknown][]) {
  const items = meta
    .map(([key, value]) => html`<span class="rounded-md bg-muted px-2 py-1 text-xs text-foreground-muted"><dt class="inline">${key}</dt><dd class="inline">: ${formatMeta(value)}</dd></span>`.html)
    .join('')
  return raw(`<dl class="flex flex-wrap gap-2 pt-1">${items}</dl>`)
}

function statusBadge(status: string) {
  const tone = badgeTone(status)
  return html`<span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tone}">${humanize(status)}</span>`
}

function badgeTone(status: string): string {
  const normalized = status.toLowerCase()
  if (['ok', 'ready', 'released', 'complete', 'completed', 'healthy', 'success'].includes(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (['deploying', 'active', 'running', 'in-progress', 'progress'].includes(normalized)) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  if (['queued', 'pending', 'planned', 'waiting'].includes(normalized)) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (['failed', 'blocked', 'error', 'incident', 'danger'].includes(normalized)) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  return 'border-border bg-muted text-foreground-muted'
}

function humanize(value: string): string {
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMeta(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function asEntries(value: unknown): readonly StatusEntry[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is StatusEntry => Boolean(entry) && typeof entry === 'object')
}
