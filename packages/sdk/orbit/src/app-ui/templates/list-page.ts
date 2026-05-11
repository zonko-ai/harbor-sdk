import {
  defineOrbitApp,
  Card,
  Hero,
  ItemList,
  Page,
  Section,
  Stack,
  html,
  raw,
  response,
} from '../index'

export type ListPageColumnType = 'text' | 'date' | 'badge'

export interface ListPageColumn {
  readonly key: string
  readonly label: string
  readonly type?: ListPageColumnType | undefined
}

export interface ListPageTemplateConfig {
  readonly name?: string | undefined
  readonly title: string
  readonly description?: string | undefined
  readonly eyebrow?: string | undefined
  readonly columns: readonly ListPageColumn[]
  readonly emptyMessage?: string | undefined
  readonly jobs: {
    readonly list: string
  }
}

export interface ListRouteResult {
  readonly items?: readonly Record<string, unknown>[] | undefined
}

export interface RouteRenderInput {
  readonly result?: ListRouteResult | readonly Record<string, unknown>[] | undefined
}

export function listPageTemplate(config: ListPageTemplateConfig) {
  return defineOrbitApp({
    name: config.name ?? slugify(config.title),
    description: config.description ?? `Listing page for ${config.title}`,
    jobs: {
      list: { name: config.jobs.list },
    },
    routes: [
      {
        method: 'GET',
        path: '/',
        title: config.title,
        auth: 'public',
        input: 'none',
        output: 'html',
        job: 'list',
        render: ({ result }: RouteRenderInput) => response(renderListPage(config, normalizeItems(result))),
      },
    ],
  })
}

function renderListPage(config: ListPageTemplateConfig, items: readonly Record<string, unknown>[]) {
  return Page({ title: config.title, description: config.description, maxWidth: 'lg' }, [
    Hero({
      eyebrow: config.eyebrow,
      title: config.title,
      description: config.description,
    }),
    Section({
      title: 'Items',
      description: `${items.length} ${items.length === 1 ? 'record' : 'records'}`,
    }, [
      ItemList({
        items,
        empty: Card({ tone: 'muted' }, [config.emptyMessage ?? 'Nothing here yet.']),
        render: (item) => renderItemCard(config.columns, item),
        tag: 'div',
        gap: 'md',
      }),
    ]),
  ])
}

function renderItemCard(columns: readonly ListPageColumn[], item: Record<string, unknown>) {
  const [headingColumn, ...metadataColumns] = columns
  const heading = headingColumn ? formatValue(readPath(item, headingColumn.key), headingColumn.type) : 'Untitled'

  return Card({ padding: 'md' }, [
    Stack({ gap: 'sm' }, [
      html`<div class="text-base font-medium tracking-tight text-foreground">${raw(heading)}</div>`,
      metadataColumns.length > 0
        ? html`<dl class="grid gap-2 text-sm text-foreground-muted sm:grid-cols-2">${raw(metadataColumns.map((column) => renderMetadataRow(column, item)).join(''))}</dl>`
        : '',
    ]),
  ])
}

function renderMetadataRow(column: ListPageColumn, item: Record<string, unknown>): string {
  const value = readPath(item, column.key)
  const rendered = column.type === 'badge'
    ? `<span class="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">${formatValue(value, column.type)}</span>`
    : formatValue(value, column.type)

  return `<div><dt class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-soft">${escapeText(column.label)}</dt><dd class="mt-1">${rendered}</dd></div>`
}

function normalizeItems(result: RouteRenderInput['result']): readonly Record<string, unknown>[] {
  if (Array.isArray(result)) return result.filter(isRecord)
  if (result && typeof result === 'object' && 'items' in result) {
    const items = (result as { items?: unknown }).items
    if (Array.isArray(items)) return items.filter(isRecord)
  }
  return []
}

function readPath(item: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, part) => {
    if (!isRecord(value)) return undefined
    return value[part]
  }, item)
}

function formatValue(value: unknown, type: ListPageColumnType = 'text'): string {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'date') {
    const date = new Date(String(value))
    if (!Number.isNaN(date.getTime())) return escapeText(date.toLocaleDateString())
  }
  return escapeText(String(value))
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return slug || 'list-page'
}
