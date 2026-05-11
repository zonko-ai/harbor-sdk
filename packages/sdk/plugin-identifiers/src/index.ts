// Canonical identifier + tool-signature mechanics shared by every Harbor
// surface that emits a `<jsVar>.<tool>(...)` text snippet — API tool-search,
// Lighthouse tools/schema, Coast `hrbr tools`, Web /skill.md.
//
// Pure string utilities. No effect, no Schema, no I/O. CI grep guards
// against an `effect` import sneaking in.

const JS_RESERVED = new Set([
  'abstract',
  'arguments',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'undefined',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
])

export function toSafeIdentifier(name: string): string {
  return `h_${Array.from(name)
    .map((ch) => ch.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('_')}`
}

export function toSanitizedIdentifier(name: string): string {
  if (!name) return '_'

  let sanitized = name.replace(/[-.\s]/g, '_')
  sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, '')

  if (!sanitized) return '_'
  if (/^[0-9]/.test(sanitized)) sanitized = `_${sanitized}`
  if (JS_RESERVED.has(sanitized)) sanitized = `${sanitized}_`

  return sanitized
}

/**
 * Normalize a tool/method name to camelCase.
 *
 * Idempotent: toCamelCase(toCamelCase(x)) === toCamelCase(x).
 *
 * Tokenizes on:
 *   - explicit separators: '-', '_', '.', ASCII whitespace
 *   - camelCase boundaries: lower→Upper transition (so `parseURL` → ['parse','URL'])
 *
 * Then: head token lowercased, tail tokens TitleCased (first upper, rest lower).
 * Adjacent uppercase runs (e.g. `XMLHttp`) are NOT split — tool names that look
 * like this are pathological and not present in any registered source.
 *
 * No prefix stripping. No JS-reserved-word handling (that lives in
 * `toSanitizedIdentifier`).
 */
export function toCamelCase(name: string): string {
  if (!name) return name
  const SENTINEL = String.fromCharCode(1)
  const tokens = name
    .replace(/([a-z0-9])([A-Z])/g, `$1${SENTINEL}$2`)
    .split(new RegExp(`[-_.\\s${SENTINEL}]+`))
    .filter((t) => t.length > 0)
  if (tokens.length === 0) return name
  const head = tokens[0]!.toLowerCase()
  const tail = tokens
    .slice(1)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')
  return head + tail
}

// Cheap identifier-shape gate used when deciding whether a derived form
// (sanitized or camel) is a legal JS const declaration.
const JS_IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/

function isLegalJsBinding(name: string): boolean {
  return name.length > 0 && JS_IDENTIFIER_RE.test(name) && !JS_RESERVED.has(name)
}

export function buildNamespaceAliases(
  namespaces: ReadonlyArray<string>
): Map<string, ReadonlyArray<string>> {
  const sanitizedCounts = new Map<string, number>()
  const camelCounts = new Map<string, number>()

  for (const namespace of namespaces) {
    const sanitized = toSanitizedIdentifier(namespace)
    const camel = toCamelCase(namespace)
    sanitizedCounts.set(sanitized, (sanitizedCounts.get(sanitized) ?? 0) + 1)
    camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1)
  }

  return new Map(
    namespaces.map((namespace) => {
      const encoded = toSafeIdentifier(namespace)
      const sanitized = toSanitizedIdentifier(namespace)
      const camel = toCamelCase(namespace)
      const aliases = [encoded]
      const seen = new Set<string>([encoded])

      // Sanitized form (e.g. `notion_mcp` for `notion-mcp`). Skipped
      // when it would collapse two distinct raw namespaces onto the
      // same JS const, or when the sanitized form is a JS reserved word
      // (toSanitizedIdentifier already trailing-underscores reserved
      // words, so the second check is belt-and-braces).
      if (
        !seen.has(sanitized) &&
        sanitizedCounts.get(sanitized) === 1 &&
        isLegalJsBinding(sanitized)
      ) {
        aliases.push(sanitized)
        seen.add(sanitized)
      }

      // CamelCase form (e.g. `notionMcp` for `notion-mcp`). Same
      // collision rule as sanitized, plus a hard drop on JS-reserved
      // camel results (`if-mcp` → `ifMcp` is fine, `if` → `if` is not).
      if (!seen.has(camel) && camelCounts.get(camel) === 1 && isLegalJsBinding(camel)) {
        aliases.push(camel)
        seen.add(camel)
      }

      return [namespace, aliases] as const
    })
  )
}

/**
 * Build the alias list for a set of tool names within a single source.
 *
 * Returns `[raw, camelCase]` (deduped, with collision suppression).
 * The sanitized form is intentionally NOT exposed for tool names: for
 * any realistic tool input the sanitized form is either equal to the
 * raw name (no separators) or strictly less useful than the camel
 * form. No prefix stripping.
 *
 * Collision rules (per source):
 *   - drop camel if it equals raw (no-op alias)
 *   - drop camel if another raw tool already owns that identifier
 *   - drop camel if multiple raw tools collapse to the same camel form
 */
export function buildToolAliases(
  toolNames: ReadonlyArray<string>
): Map<string, ReadonlyArray<string>> {
  const rawNameSet = new Set(toolNames)
  const camelCounts = new Map<string, number>()

  for (const toolName of toolNames) {
    const camel = toCamelCase(toolName)
    if (camel !== toolName && !rawNameSet.has(camel)) {
      camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1)
    }
  }

  return new Map(
    toolNames.map((toolName) => {
      const camel = toCamelCase(toolName)
      const aliases = [toolName]

      if (camel !== toolName && !rawNameSet.has(camel) && camelCounts.get(camel) === 1) {
        aliases.push(camel)
      }

      return [toolName, aliases] as const
    })
  )
}

/**
 * Rank candidate identifiers by relevance to a needle for "did you mean"
 * suggestions. Combines:
 *   - exact match on the folded form (case/separator-insensitive) → top
 *   - prefix match on folded form → high
 *   - substring match on folded form → mid
 *   - shared-token overlap → low
 *
 * Folded form: lowercase, strip `-`, `_`, `.`, whitespace. So
 * `notionFetch`, `notion-fetch`, `notion_fetch`, `Notion Fetch` all fold
 * to `notionfetch`. Returns up to `limit` candidates in their original
 * canonical form, highest score first; ties broken by shorter name.
 */
export function rankNearestMatches(
  needle: string,
  candidates: ReadonlyArray<string>,
  limit = 3
): ReadonlyArray<string> {
  if (!needle || candidates.length === 0 || limit <= 0) return []
  const fold = (s: string): string => s.toLowerCase().replace(/[-_.\s]/g, '')
  const target = fold(needle)
  if (!target) return []
  const targetTokens = needle
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0)
  const scored: Array<{ name: string; score: number }> = []
  for (const candidate of candidates) {
    const folded = fold(candidate)
    if (!folded) continue
    let score = 0
    if (folded === target) score = 10_000
    else if (folded.startsWith(target)) score = 5_000 - folded.length
    else if (folded.includes(target)) score = 2_000 - folded.length
    else if (target.includes(folded)) score = 1_000 - folded.length
    else if (targetTokens.length > 0) {
      const overlap = targetTokens.filter((t) => folded.includes(t)).length
      if (overlap > 0) score = overlap * 100 - folded.length
    }
    if (score > 0) scored.push({ name: candidate, score })
  }
  scored.sort((a, b) => b.score - a.score || a.name.length - b.name.length)
  return scored.slice(0, limit).map((entry) => entry.name)
}

export interface ToolSignatureInput {
  readonly namespace: string
  readonly name: string
  readonly input_schema?: unknown
  readonly output_schema?: unknown
}

const MAX_FIELDS = 6
const MAX_DEPTH = 2

/**
 * Canonical JS identifier shown for a namespace in rendered tool
 * signatures, call examples, search hits, and `js_var` API fields.
 *
 * Prefers the camelCase form (`notion-mcp` → `notionMcp`) when it is a
 * legal JS binding. Falls back to the sanitized form
 * (`notion-mcp` → `notion_mcp`) for namespaces whose camelCase result is
 * empty, malformed, or a reserved word. Both forms are also registered
 * as runtime aliases by `buildNamespaceAliases`, so any of camel /
 * sanitized / encoded / raw is accepted at dispatch time — this helper
 * picks the documented preferred form.
 */
export function namespaceToJsVar(namespace: string): string {
  const camel = toCamelCase(namespace)
  if (isLegalJsBinding(camel)) return camel
  return toSanitizedIdentifier(namespace)
}

/**
 * Canonical signature shape, identical on every Harbor return surface:
 *   <jsVar>.<toolNameCamel>(<param>: <Type>, <opt>?: <Type>): Promise<<Ret>>
 *
 * Top-level required + optional input properties become flat positional-named
 * params (NOT a single `input: { ... }` struct), matching how an LLM expects
 * to read a TS function signature. The runtime call shape stays
 * `tool({ ... })` — see renderToolCallExample below.
 *
 * Falls back to a single `input: <Type>` slot when the schema is missing,
 * non-object, or has no properties.
 */
export function renderToolSignature(tool: ToolSignatureInput): string {
  const jsVar = namespaceToJsVar(tool.namespace)
  const name = toCamelCase(tool.name)
  const params = renderParams(tool.input_schema)
  const output = renderSchemaType(tool.output_schema, 0)
  return `${jsVar}.${name}(${params}): Promise<${output}>`
}

export function renderToolCallExample(
  tool: Pick<ToolSignatureInput, 'namespace' | 'name' | 'input_schema'>
): string {
  const jsVar = namespaceToJsVar(tool.namespace)
  const name = toCamelCase(tool.name)
  const input = renderExampleObject(tool.input_schema)
  return `await ${jsVar}.${name}(${input})`
}

function renderParams(schema: unknown): string {
  const record = asRecord(schema)
  if (!record) return 'input: Record<string, unknown>'
  const properties = asRecord(record.properties) ?? undefined
  const isObject = record.type === 'object' || properties !== undefined
  if (!isObject) return `input: ${renderSchemaType(record, 0)}`
  if (!properties || Object.keys(properties).length === 0) {
    return 'input: Record<string, unknown>'
  }
  const required = new Set(
    Array.isArray(record.required)
      ? record.required.filter((item): item is string => typeof item === 'string')
      : []
  )
  const entries = Object.entries(properties)
  const visible = entries.slice(0, MAX_FIELDS).map(([key, value]) => {
    const optional = required.has(key) ? '' : '?'
    return `${formatPropertyName(key)}${optional}: ${renderSchemaType(value, 1)}`
  })
  const remaining = entries.length - visible.length
  if (remaining > 0) visible.push(`/* +${remaining} fields */`)
  return visible.join(', ')
}

function renderSchemaType(schema: unknown, depth: number): string {
  const record = asRecord(schema)
  if (!record) return 'unknown'

  if (Array.isArray(record.enum) && record.enum.length > 0 && record.enum.length <= 8) {
    return record.enum.map(renderLiteral).join(' | ')
  }
  if (Array.isArray(record.const)) return renderLiteral(record.const[0])
  if ('const' in record) return renderLiteral(record.const)
  if (Array.isArray(record.oneOf)) return renderUnion(record.oneOf, depth)
  if (Array.isArray(record.anyOf)) return renderUnion(record.anyOf, depth)
  if (Array.isArray(record.allOf)) return renderIntersection(record.allOf, depth)

  const type = record.type
  if (Array.isArray(type)) {
    return (
      type
        .filter((item) => item !== 'null')
        .map((item) => renderSchemaType({ ...record, type: item }, depth))
        .join(' | ') || 'unknown'
    )
  }

  switch (type) {
    case 'string':
      return 'string'
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'null':
      return 'null'
    case 'array': {
      const itemType = renderSchemaType(record.items, depth + 1)
      return needsParens(itemType) ? `Array<${itemType}>` : `${itemType}[]`
    }
    case 'object':
      return renderObjectType(record, depth)
    default:
      if (record.properties && typeof record.properties === 'object')
        return renderObjectType(record, depth)
      if (record.items) return `${renderSchemaType(record.items, depth + 1)}[]`
      return 'unknown'
  }
}

function renderObjectType(schema: Record<string, unknown>, depth: number): string {
  if (depth >= MAX_DEPTH) return 'Record<string, unknown>'
  const properties = asRecord(schema.properties) ?? undefined
  if (!properties) return 'Record<string, unknown>'

  const required = new Set(
    Array.isArray(schema.required)
      ? schema.required.filter((item): item is string => typeof item === 'string')
      : []
  )
  const entries = Object.entries(properties)
  const visible = entries.slice(0, MAX_FIELDS).map(([key, value]) => {
    const optional = required.has(key) ? '' : '?'
    return `${formatPropertyName(key)}${optional}: ${renderSchemaType(value, depth + 1)}`
  })
  const remaining = entries.length - visible.length
  if (remaining > 0) visible.push(`/* +${remaining} fields */`)
  return `{ ${visible.join('; ')} }`
}

function renderUnion(schemas: ReadonlyArray<unknown>, depth: number): string {
  const rendered = schemas.map((schema) => renderSchemaType(schema, depth + 1))
  return [...new Set(rendered)].slice(0, 6).join(' | ') || 'unknown'
}

function renderIntersection(schemas: ReadonlyArray<unknown>, depth: number): string {
  const rendered = schemas.map((schema) => renderSchemaType(schema, depth + 1))
  return [...new Set(rendered)].slice(0, 4).join(' & ') || 'unknown'
}

function renderLiteral(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean' || value === null)
    return String(value)
  return 'unknown'
}

function needsParens(type: string): boolean {
  return type.includes(' | ') || type.includes(' & ')
}

function formatPropertyName(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
}

function renderExampleObject(schema: unknown): string {
  const record = asRecord(schema)
  if (!record) return '{}'
  const properties = asRecord(record.properties) ?? undefined
  if (!properties) return '{}'
  const required = Array.isArray(record.required)
    ? record.required.filter((item): item is string => typeof item === 'string')
    : Object.keys(properties).slice(0, 2)
  const fields = required
    .slice(0, 4)
    .map((key) => `${formatPropertyName(key)}: ${renderExampleValue(properties[key])}`)
  return `{ ${fields.join(', ')} }`
}

function renderExampleValue(schema: unknown): string {
  const record = asRecord(schema)
  if (!record) return 'undefined'
  if (Array.isArray(record.enum) && record.enum.length > 0) return renderLiteral(record.enum[0])
  if ('const' in record) return renderLiteral(record.const)
  const type = Array.isArray(record.type)
    ? record.type.find((item) => item !== 'null')
    : record.type
  switch (type) {
    case 'string':
      return '"..."'
    case 'integer':
    case 'number':
      return '0'
    case 'boolean':
      return 'false'
    case 'array':
      return '[]'
    case 'object':
      return '{}'
    default:
      return 'undefined'
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}
