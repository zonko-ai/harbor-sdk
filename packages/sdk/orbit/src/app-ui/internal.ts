import type { OrbitUiChild, OrbitUiNode, RawHtml } from './types'

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isRawHtml(value: unknown): value is RawHtml {
  return Boolean(value && typeof value === 'object' && (value as RawHtml).$$orbit_ui_raw === true)
}

export function isNode(value: unknown): value is OrbitUiNode {
  return Boolean(value && typeof value === 'object' && (value as OrbitUiNode).$$orbit_ui === true)
}

export function node<T extends string, P>(
  type: T,
  props: Readonly<P>,
  children?: readonly OrbitUiChild[] | undefined,
): OrbitUiNode<T, P> {
  return children === undefined
    ? { $$orbit_ui: true, type, props }
    : { $$orbit_ui: true, type, props, children }
}

export function classNames(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}

export function attrs(values: Record<string, unknown>): string {
  const rendered = Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => {
      if (value === true) return key
      return `${key}="${escapeHtml(value)}"`
    })
  return rendered.length > 0 ? ` ${rendered.join(' ')}` : ''
}

export function flattenChildren(children: readonly OrbitUiChild[] | undefined): readonly OrbitUiChild[] {
  return children ?? []
}
