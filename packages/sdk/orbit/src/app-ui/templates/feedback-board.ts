import {
  Button,
  Card,
  defineOrbitApp,
  Form,
  Hero,
  ItemList,
  Page,
  Section,
  Stack,
  TextArea,
  TextField,
  html,
  response,
} from '../index'
import type { OrbitUiChild } from '../types'


export type RouteAuth = 'public' | 'workspace_member'
export type JobRef = string | { readonly name: string; readonly version?: string }
export type AppResponse = { readonly html: string; readonly status?: number; readonly headers?: Record<string, string> }

export interface OrbitAppDefinition {
  readonly name: string
  readonly description?: string
  readonly jobs: Record<string, { readonly name: string; readonly version?: string }>
  readonly routes: readonly {
    readonly method: 'GET' | 'POST'
    readonly path: string
    readonly title?: string
    readonly auth: RouteAuth
    readonly input: 'none' | 'form'
    readonly output: 'html'
    readonly job: string
    readonly render?: (ctx: { readonly result?: unknown }) => AppResponse
  }[]
}

export interface FeedbackFieldConfig {
  readonly name?: string
  readonly label?: string
  readonly placeholder?: string
  readonly help?: string
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly rows?: number
}

export interface FeedbackListConfig {
  readonly title?: string
  readonly eyebrow?: string
  readonly emptyMessage?: string
  readonly limit?: number
  readonly showSource?: boolean
  readonly showDate?: boolean
}

export interface FeedbackBoardTemplateConfig {
  readonly name?: string
  readonly description?: string
  readonly jobs: { readonly submit: JobRef; readonly list: JobRef }
  readonly title: string
  readonly eyebrow?: string
  readonly intro?: string
  readonly boardPath?: string
  readonly auth?: RouteAuth
  readonly submitField?: FeedbackFieldConfig
  readonly nameField?: { readonly enabled?: boolean; readonly label?: string; readonly placeholder?: string }
  readonly emailField?: { readonly enabled?: boolean; readonly label?: string; readonly placeholder?: string }
  readonly submitLabel?: string
  readonly thanksTitle?: string
  readonly thanksMessage?: string
  readonly footer?: string
  readonly list?: FeedbackListConfig
  /**
   * Optional override for how each feedback item is rendered in the recent
   * list. The default renders a Card with the body and a small meta line.
   * Tier-2 authors override this to add badges, votes, custom layouts, etc.
   */
  readonly renderItem?: (item: FeedbackItem, ctx: FeedbackItemContext) => OrbitUiChild
}

export interface FeedbackItem {
  readonly id?: string
  readonly title?: string
  readonly body?: string
  readonly text?: string
  readonly source?: string
  readonly status?: string
  readonly votes?: number
  readonly created_at?: string
  readonly createdAt?: string
}

export interface FeedbackItemContext {
  readonly index: number
  readonly meta: string | undefined
  readonly body: string
}

const jobRef = (value: JobRef) => typeof value === 'string' ? { name: value } : value
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const itemsFrom = (result: unknown, limit: number): readonly FeedbackItem[] => {
  const items = record(result).items
  return Array.isArray(items) ? items.slice(0, limit) as FeedbackItem[] : []
}
const itemBody = (item: FeedbackItem) => item.body ?? item.text ?? item.title ?? ''

function dateLabel(value: string | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function metaLine(item: FeedbackItem, list: Required<Pick<FeedbackListConfig, 'showDate' | 'showSource'>>) {
  const parts = [
    list.showSource ? item.source : undefined,
    list.showDate ? dateLabel(item.created_at ?? item.createdAt) : undefined,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : undefined
}

function renderBoard(config: FeedbackBoardTemplateConfig, result: unknown) {
  const field = config.submitField ?? {}
  const list = {
    title: config.list?.title ?? 'Recent feedback',
    eyebrow: config.list?.eyebrow ?? 'recent',
    emptyMessage: config.list?.emptyMessage ?? 'No feedback yet. Be the first.',
    limit: config.list?.limit ?? 50,
    showDate: config.list?.showDate ?? true,
    showSource: config.list?.showSource ?? true,
  }

  // Page eyebrow omitted intentionally — Hero owns the eyebrow when present.
  return Page({ title: config.title, description: config.intro, maxWidth: 'md' }, [
    Hero({ eyebrow: config.eyebrow, title: config.title, description: config.intro }),
    Form({ action: config.boardPath ?? '/', method: 'POST', submitLabel: config.submitLabel ?? 'Submit' }, [
      Card({}, [
        Stack({ gap: 'md' }, [
          TextArea({
            name: field.name ?? 'body',
            label: field.label ?? 'Your feedback',
            placeholder: field.placeholder ?? 'The thing I want is…',
            help: field.help ?? 'Be specific. Your feedback enters the roadmap loop.',
            required: field.required ?? true,
            minLength: field.minLength ?? 3,
            maxLength: field.maxLength ?? 2000,
            rows: field.rows ?? 4,
          }),
          config.nameField?.enabled === false ? null : TextField({ name: 'submitter_name', label: config.nameField?.label ?? 'Name', placeholder: config.nameField?.placeholder ?? 'Optional' }),
          config.emailField?.enabled === false ? null : TextField({ name: 'submitter_email', label: config.emailField?.label ?? 'Email', type: 'email', placeholder: config.emailField?.placeholder ?? 'Optional' }),
        ]),
      ]),
    ]),
    Section({ title: list.title, eyebrow: list.eyebrow }, [
      ItemList({
        items: itemsFrom(result, list.limit),
        empty: list.emptyMessage,
        render: (item, index) => {
          const meta = metaLine(item, list)
          const body = itemBody(item)
          if (config.renderItem) return config.renderItem(item, { index, meta, body })
          return Card({ padding: 'md' }, [
            html`<p class="text-sm leading-6 text-foreground">${body}</p>`,
            meta ? html`<p class="mt-2 text-xs text-foreground-soft">${meta}</p>` : null,
          ])
        },
      }),
    ]),
    config.footer ? html`<footer class="mt-16 border-t border-border-subtle pt-6 text-xs text-foreground-soft">${config.footer}</footer>` : null,
  ])
}

function renderThanks(config: FeedbackBoardTemplateConfig, result: unknown) {
  const id = String(record(result).item_id ?? record(result).id ?? '')
  return Page({ title: config.thanksTitle ?? 'Thanks — feedback received', description: config.thanksMessage, maxWidth: 'md' }, [
    Hero({
      eyebrow: 'received',
      title: config.thanksTitle ?? 'Thanks — we have it.',
      description: config.thanksMessage ?? 'Your feedback was added to the board and will be reviewed in the roadmap loop.',
    }),
    id ? Card({ tone: 'muted' }, [html`<p class="text-xs text-foreground-soft">Reference: ${id}</p>`]) : null,
    Button({ href: config.boardPath ?? '/', variant: 'outline' }, ['Back to the board']),
  ])
}

export function feedbackBoardTemplate(config: FeedbackBoardTemplateConfig): OrbitAppDefinition {
  const path = config.boardPath ?? '/'
  const auth = config.auth ?? 'public'
  return defineOrbitApp({
    name: config.name ?? 'feedback-board',
    description: config.description ?? 'Feedback board with an intake form and listed submissions.',
    jobs: { submit: jobRef(config.jobs.submit), list: jobRef(config.jobs.list) },
    routes: [
      { method: 'GET', path, title: config.title, auth, input: 'none', output: 'html', job: 'list', render: ({ result }) => response(renderBoard(config, result)) },
      { method: 'POST', path, title: config.submitLabel ?? 'Submit feedback', auth, input: 'form', output: 'html', job: 'submit', render: ({ result }) => response(renderThanks(config, result)) },
    ],
  })
}
