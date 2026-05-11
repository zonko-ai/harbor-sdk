import type {
  ArtifactOptions,
  ArtifactOrbit,
  ButtonProps,
  CardProps,
  FormProps,
  HeroProps,
  ItemListProps,
  OrbitUiChild,
  OrbitUiNode,
  OrbitUiRenderable,
  PageProps,
  RawHtml,
  RenderOptions,
  SectionProps,
  StackProps,
  TextAreaProps,
  TextFieldProps,
} from './types'
import { attrs, classNames, escapeHtml, flattenChildren, isNode, isRawHtml, node } from './internal'

// Keep token values in sync with lib/theme.ts, which is the canonical theme source.
const INLINE_THEME_STYLE = `<style data-orbit-ui-theme>:root{--background:0.985 0.006 80;--foreground:0.18 0.01 260;--foreground-muted:0.52 0.015 260;--foreground-soft:0.62 0.012 260;--card:1 0 0;--border:0.86 0.012 80;--border-subtle:0.92 0.008 80;--primary:0.54 0.10 125;--primary-foreground:1 0 0;--primary-hover:0.49 0.10 125;--muted:0.95 0.008 80;--radius-md:0.5rem;--radius-lg:0.75rem;--radius-xl:1rem;--font-sans:'Inter',ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:var(--font-sans);background:oklch(var(--background));color:oklch(var(--foreground));text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}button,input,textarea{font:inherit}button,a{touch-action:manipulation}.bg-background{background:oklch(var(--background))}.bg-card{background:oklch(var(--card))}.bg-muted{background:oklch(var(--muted))}.bg-primary{background:oklch(var(--primary))}.text-foreground{color:oklch(var(--foreground))}.text-foreground-muted{color:oklch(var(--foreground-muted))}.text-foreground-soft{color:oklch(var(--foreground-soft))}.text-primary{color:oklch(var(--primary))}.text-primary-foreground{color:oklch(var(--primary-foreground))}.border-border{border-color:oklch(var(--border))}.border-border-subtle{border-color:oklch(var(--border-subtle))}.ring-border{--tw-ring-color:oklch(var(--border))}</style>`

const maxWidthClass = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const

const gapClass = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const

const alignClass = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

const cardToneClass = {
  default: 'bg-card ring-border-subtle',
  muted: 'bg-muted ring-border-subtle',
  danger: 'bg-card ring-red-200',
  success: 'bg-card ring-emerald-200',
} as const

const cardPaddingClass = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

const buttonVariantClass = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-foreground-muted hover:bg-muted hover:text-foreground',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

const buttonSizeClass = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-base',
} as const

const listGapClass = {
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
} as const

export function raw(s: string): RawHtml {
  return { $$orbit_ui_raw: true, html: s }
}

export function text(value: unknown): string {
  return escapeHtml(value)
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): RawHtml {
  let out = ''
  for (let index = 0; index < strings.length; index += 1) {
    out += strings[index] ?? ''
    if (index < values.length) {
      const value = values[index]
      out += isRawHtml(value) ? value.html : escapeHtml(value)
    }
  }
  return raw(out)
}

export function Page(props: PageProps, children?: OrbitUiChild[]): OrbitUiNode<'Page', PageProps> {
  return node('Page', props, children)
}

export function Section(props: SectionProps, children?: OrbitUiChild[]): OrbitUiNode<'Section', SectionProps> {
  return node('Section', props, children)
}

export function Stack(props: StackProps = {}, children?: OrbitUiChild[]): OrbitUiNode<'Stack', StackProps> {
  return node('Stack', props, children)
}

export function Card(props: CardProps = {}, children?: OrbitUiChild[]): OrbitUiNode<'Card', CardProps> {
  return node('Card', props, children)
}

export function Hero(props: HeroProps, children?: OrbitUiChild[]): OrbitUiNode<'Hero', HeroProps> {
  return node('Hero', props, children)
}

export function Form(props: FormProps, children?: OrbitUiChild[]): OrbitUiNode<'Form', FormProps> {
  return node('Form', props, children)
}

export function TextField(props: TextFieldProps): OrbitUiNode<'TextField', TextFieldProps> {
  return node('TextField', props)
}

export function TextArea(props: TextAreaProps): OrbitUiNode<'TextArea', TextAreaProps> {
  return node('TextArea', props)
}

export function Button(props: ButtonProps, children?: OrbitUiChild[]): OrbitUiNode<'Button', ButtonProps> {
  return node('Button', props, children)
}

export function ItemList<T>(props: ItemListProps<T>): OrbitUiNode<'ItemList', ItemListProps<T>> {
  return node('ItemList', props)
}

export function render(nodeToRender: OrbitUiRenderable, opts: RenderOptions = {}): string {
  const body = serializeRenderable(nodeToRender)
  const page = findPage(nodeToRender)
  const document = opts.document ?? page?.props.chrome !== 'fragment'
  if (!document) return body

  const title = opts.title ?? page?.props.title ?? 'Orbit App'
  const description = opts.description ?? page?.props.description
  const nonceAttr = opts.nonce ? ` nonce="${escapeHtml(opts.nonce)}"` : ''
  const styleBlock = opts.nonce
    ? INLINE_THEME_STYLE.replace('<style ', `<style${nonceAttr} `)
    : INLINE_THEME_STYLE

  return `<!doctype html><html lang="en" class="h-full"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(title)}</title>${description ? `<meta name="description" content="${escapeHtml(description)}"/>` : ''}<script src="https://cdn.tailwindcss.com"></script><link rel="preconnect" href="https://rsms.me/"/><link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>${styleBlock}</head><body class="min-h-full">${body}</body></html>`
}

export function response(
  nodeToRender: OrbitUiRenderable,
  opts: RenderOptions = {},
): { html: string; status?: number; headers?: Record<string, string> } {
  return {
    html: render(nodeToRender, { ...opts, document: opts.document ?? true }),
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  }
}

export async function artifact(
  orbit: ArtifactOrbit,
  key: string,
  nodeToRender: OrbitUiRenderable,
  opts: ArtifactOptions = {},
): Promise<{ key: string; content_type: string; url?: string }> {
  const contentType = opts.contentType ?? 'text/html'
  const body = contentType === 'text/markdown'
    ? render(nodeToRender, { ...opts, document: false })
    : render(nodeToRender, opts)
  await orbit.storage.put(key, body, { content_type: contentType })
  const url = opts.publicUrl === true && orbit.storage.url ? await orbit.storage.url(key) : undefined
  return url === undefined ? { key, content_type: contentType } : { key, content_type: contentType, url }
}

function serializeRenderable(value: OrbitUiRenderable): string {
  if (Array.isArray(value)) return (value as readonly OrbitUiChild[]).map(serializeChild).join('')
  return serializeChild(value as OrbitUiChild)
}

function serializeChild(value: OrbitUiChild): string {
  if (value === null || value === undefined || value === false) return ''
  if (isRawHtml(value)) return value.html
  if (isNode(value)) return serializeNode(value)
  return escapeHtml(value)
}

function serializeChildren(children: readonly OrbitUiChild[] | undefined): string {
  return flattenChildren(children).map(serializeChild).join('')
}

function serializeNode(value: OrbitUiNode): string {
  switch (value.type) {
    case 'Page':
      return serializePage(value as OrbitUiNode<'Page', PageProps>)
    case 'Section':
      return serializeSection(value as OrbitUiNode<'Section', SectionProps>)
    case 'Stack':
      return serializeStack(value as OrbitUiNode<'Stack', StackProps>)
    case 'Card':
      return serializeCard(value as OrbitUiNode<'Card', CardProps>)
    case 'Hero':
      return serializeHero(value as OrbitUiNode<'Hero', HeroProps>)
    case 'Form':
      return serializeForm(value as OrbitUiNode<'Form', FormProps>)
    case 'TextField':
      return serializeTextField(value.props as unknown as TextFieldProps)
    case 'TextArea':
      return serializeTextArea(value.props as unknown as TextAreaProps)
    case 'Button':
      return serializeButton(value as OrbitUiNode<'Button', ButtonProps>)
    case 'ItemList':
      return serializeItemList(value as OrbitUiNode<'ItemList', ItemListProps>)
    default:
      return ''
  }
}

function serializePage(value: OrbitUiNode<'Page', PageProps>): string {
  const width = maxWidthClass[value.props.maxWidth ?? 'md']
  // Page intentionally does not render its own eyebrow — Hero/Section own that
  // role. Page eyebrow prop is kept on the type for future top-level chrome
  // (e.g. nav strip) but is not rendered today to avoid duplicating Hero.
  return `<main class="mx-auto ${width} px-4 py-12 sm:px-6">${serializeChildren(value.children)}</main>`
}

function serializeSection(value: OrbitUiNode<'Section', SectionProps>): string {
  const header = value.props.title || value.props.eyebrow || value.props.description || value.props.action
    ? `<header class="mb-3 flex items-start justify-between gap-4 border-t border-border-subtle pt-3"><div>${value.props.eyebrow ? `<p class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-soft">${escapeHtml(value.props.eyebrow)}</p>` : ''}${value.props.title ? `<h2 class="mt-1 text-lg tracking-tight text-foreground">${escapeHtml(value.props.title)}</h2>` : ''}${value.props.description ? `<p class="mt-1 max-w-xl text-sm text-foreground-muted">${escapeHtml(value.props.description)}</p>` : ''}</div>${value.props.action ? `<div class="shrink-0">${serializeChild(value.props.action)}</div>` : ''}</header>`
    : ''
  return `<section class="mt-8">${header}<div class="space-y-2">${serializeChildren(value.children)}</div></section>`
}

function serializeStack(value: OrbitUiNode<'Stack', StackProps>): string {
  return `<div class="flex flex-col ${gapClass[value.props.gap ?? 'md']} ${alignClass[value.props.align ?? 'stretch']}">${serializeChildren(value.children)}</div>`
}

function serializeCard(value: OrbitUiNode<'Card', CardProps>): string {
  return `<div class="rounded-2xl ${cardToneClass[value.props.tone ?? 'default']} ${cardPaddingClass[value.props.padding ?? 'md']} shadow-sm ring-1">${serializeChildren(value.children)}</div>`
}

function serializeHero(value: OrbitUiNode<'Hero', HeroProps>): string {
  return `<header class="flex flex-col gap-3">${value.props.eyebrow ? `<p class="text-xs font-medium uppercase tracking-[0.12em] text-primary">${escapeHtml(value.props.eyebrow)}</p>` : ''}<h1 class="text-3xl tracking-tight text-foreground sm:text-4xl">${escapeHtml(value.props.title)}</h1>${value.props.description ? `<p class="max-w-xl text-base text-foreground-muted">${escapeHtml(value.props.description)}</p>` : ''}${value.props.cta ? `<div class="pt-2"><a class="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90" href="${escapeHtml(value.props.cta.href)}">${escapeHtml(value.props.cta.label)}</a></div>` : ''}${serializeChildren(value.children)}</header>`
}

function serializeForm(value: OrbitUiNode<'Form', FormProps>): string {
  const submit = value.props.submitLabel
    ? serializeButton(Button({ type: 'submit' }, [value.props.submitLabel]))
    : ''
  return `<form${attrs({ action: value.props.action, method: value.props.method ?? 'POST', enctype: value.props.enctype })} class="mt-8 space-y-4">${serializeChildren(value.children)}${submit ? `<div class="flex justify-end">${submit}</div>` : ''}</form>`
}

function serializeTextField(props: TextFieldProps): string {
  if ((props.type ?? 'text') === 'hidden') {
    return `<input${attrs({ type: 'hidden', name: props.name, value: props.value ?? '' })}/>`
  }
  const id = fieldId(props.name)
  const helpId = props.help ? `${id}-help` : undefined
  const errorId = props.error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  return `<div><label class="text-sm font-medium text-foreground" for="${escapeHtml(id)}">${escapeHtml(props.label)}</label><input${attrs({ id, name: props.name, type: props.type ?? 'text', value: props.value, placeholder: props.placeholder, required: props.required, minlength: props.minLength, maxlength: props.maxLength, 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': describedBy })} class="mt-2 min-h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-soft focus:outline-none focus:ring-2 focus:ring-primary/30"/>${fieldMeta(props.help, props.error, helpId, errorId)}</div>`
}

function serializeTextArea(props: TextAreaProps): string {
  const id = fieldId(props.name)
  const helpId = props.help ? `${id}-help` : undefined
  const errorId = props.error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  return `<div><label class="text-sm font-medium text-foreground" for="${escapeHtml(id)}">${escapeHtml(props.label)}</label><textarea${attrs({ id, name: props.name, placeholder: props.placeholder, required: props.required, minlength: props.minLength, maxlength: props.maxLength, rows: props.rows ?? 4, 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': describedBy })} class="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-soft focus:outline-none focus:ring-2 focus:ring-primary/30">${escapeHtml(props.value ?? '')}</textarea>${fieldMeta(props.help, props.error, helpId, errorId)}</div>`
}

function serializeButton(value: OrbitUiNode<'Button', ButtonProps>): string {
  const props = value.props
  const cls = classNames('inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', buttonSizeClass[props.size ?? 'md'], buttonVariantClass[props.variant ?? 'primary'])
  const label = serializeChildren(value.children)
  if (props.href) {
    return `<a${attrs({ href: props.href })} class="${cls}">${label}</a>`
  }
  return `<button${attrs({ type: props.type ?? 'button', name: props.name, value: props.value, disabled: props.disabled })} class="${cls}">${label}</button>`
}

function serializeItemList(value: OrbitUiNode<'ItemList', ItemListProps>): string {
  const props = value.props
  const tag = props.tag ?? 'ul'
  if (props.items.length === 0) {
    return `<div class="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-foreground-muted">${serializeChild(props.empty ?? 'Nothing here yet.')}</div>`
  }
  const items = props.items
    .map((item, index) => {
      const rendered = serializeChild(props.render(item, index))
      return tag === 'div' ? `<div>${rendered}</div>` : `<li>${rendered}</li>`
    })
    .join('')
  return `<${tag} class="${listGapClass[props.gap ?? 'sm']}">${items}</${tag}>`
}

function fieldId(name: string): string {
  return `orbit-ui-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function fieldMeta(help: string | undefined, error: string | undefined, helpId: string | undefined, errorId: string | undefined): string {
  return `${help ? `<p id="${escapeHtml(helpId)}" class="mt-2 text-xs text-foreground-soft">${escapeHtml(help)}</p>` : ''}${error ? `<p id="${escapeHtml(errorId)}" class="mt-2 text-xs text-red-600">${escapeHtml(error)}</p>` : ''}`
}

function findPage(value: OrbitUiRenderable): OrbitUiNode<'Page', PageProps> | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findPage(child)
      if (found) return found
    }
    return undefined
  }
  if (!isNode(value)) return undefined
  if (value.type === 'Page') return value as OrbitUiNode<'Page', PageProps>
  for (const child of value.children ?? []) {
    const found = findPage(child)
    if (found) return found
  }
  return undefined
}
