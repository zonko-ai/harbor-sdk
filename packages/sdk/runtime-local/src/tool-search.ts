export interface HarborLocalToolIndexRecord {
  readonly id: string
  readonly workspaceId: "local"
  readonly sourceRefId: string
  readonly namespace: string
  readonly name: string
  readonly displayName: string
  readonly description?: string | undefined
  readonly inputSchema?: unknown
  readonly outputSchema?: unknown
  readonly searchText: string
}

export interface HarborLocalToolSearchInput {
  readonly query: string
  readonly limit?: number | undefined
  readonly namespace?: string | undefined
}

export interface HarborLocalToolSchemasInput {
  readonly namespace?: string | undefined
}

export interface HarborLocalToolSearchHit {
  readonly toolId: string
  readonly namespace: string
  readonly name: string
  readonly displayName: string
  readonly description?: string | undefined
  readonly score: number
}

export interface HarborLocalToolDescription {
  readonly toolId: string
  readonly namespace: string
  readonly name: string
  readonly displayName: string
  readonly description?: string | undefined
  readonly inputSchema?: unknown
  readonly outputSchema?: unknown
}

export type HarborLocalToolSchema = Pick<
  HarborLocalToolDescription,
  "toolId" | "inputSchema" | "outputSchema"
>

export interface HarborLocalToolCallInput {
  readonly toolId: string
  readonly input: unknown
}

export interface HarborLocalToolCallResult {
  readonly toolId: string
  readonly output: unknown
}

export type HarborLocalToolCallHandler = (
  input: HarborLocalToolCallInput,
  tool: HarborLocalToolDescription
) => Promise<HarborLocalToolCallResult> | HarborLocalToolCallResult

export interface HarborLocalToolIndexOptions {
  readonly callTool?: HarborLocalToolCallHandler | undefined
}

export interface HarborLocalToolIndex {
  readonly search: (input: HarborLocalToolSearchInput) => readonly HarborLocalToolSearchHit[]
  readonly describe: (toolId: string) => HarborLocalToolDescription | null
  readonly schema: (toolId: string) => HarborLocalToolSchema | null
  readonly schemas: (input?: HarborLocalToolSchemasInput) => readonly HarborLocalToolSchema[]
  readonly call: (input: HarborLocalToolCallInput) => Promise<HarborLocalToolCallResult>
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/g)
    .map((part) => part.trim())
    .filter(Boolean)
}

function termFrequency(tokens: readonly string[], term: string): number {
  return tokens.reduce((count, token) => count + (token === term ? 1 : 0), 0)
}

function toolId(record: Pick<HarborLocalToolIndexRecord, "namespace" | "name">): string {
  return `${record.namespace}.${record.name}`
}

function toDescription(record: HarborLocalToolIndexRecord): HarborLocalToolDescription {
  return {
    toolId: toolId(record),
    namespace: record.namespace,
    name: record.name,
    displayName: record.displayName,
    ...(record.description !== undefined ? { description: record.description } : {}),
    ...(record.inputSchema !== undefined ? { inputSchema: record.inputSchema } : {}),
    ...(record.outputSchema !== undefined ? { outputSchema: record.outputSchema } : {}),
  }
}

export function createHarborLocalToolIndex(
  records: readonly HarborLocalToolIndexRecord[],
  options: HarborLocalToolIndexOptions = {}
): HarborLocalToolIndex {
  const docs = records.map((record) => ({
    record,
    tokens: tokenize([
      record.namespace,
      record.name,
      record.displayName,
      record.description ?? "",
      record.searchText,
    ].join(" ")),
  }))
  const avgLength = docs.length === 0 ? 1 : docs.reduce((sum, doc) => sum + doc.tokens.length, 0) / docs.length
  const byToolId = new Map(records.map((record) => [toolId(record), record]))

  const search = (input: HarborLocalToolSearchInput): readonly HarborLocalToolSearchHit[] => {
    const terms = [...new Set(tokenize(input.query))]
    if (terms.length === 0) return []
    const limit = Math.max(1, Math.min(input.limit ?? 10, 50))
    const filtered = input.namespace
      ? docs.filter((doc) => doc.record.namespace === input.namespace)
      : docs
    const scores = filtered.map((doc) => {
      let score = 0
      for (const term of terms) {
        const tf = termFrequency(doc.tokens, term)
        if (tf === 0) continue
        const containing = filtered.filter((candidate) => candidate.tokens.includes(term)).length
        const idf = Math.log((filtered.length + 1) / (containing + 1)) + 1
        const k1 = 1.2
        const b = 0.75
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc.tokens.length / avgLength))))
      }
      if (doc.record.name.toLowerCase() === input.query.toLowerCase()) score += 5
      if (doc.record.displayName.toLowerCase().includes(input.query.toLowerCase())) score += 2
      return { doc, score }
    })
    return scores
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || toolId(a.doc.record).localeCompare(toolId(b.doc.record)))
      .slice(0, limit)
      .map(({ doc, score }) => ({
        toolId: toolId(doc.record),
        namespace: doc.record.namespace,
        name: doc.record.name,
        displayName: doc.record.displayName,
        ...(doc.record.description !== undefined ? { description: doc.record.description } : {}),
        score,
      }))
  }

  const schema = (id: string): HarborLocalToolSchema | null => {
      const record = byToolId.get(id)
      if (!record) return null
      return {
        toolId: id,
        ...(record.inputSchema !== undefined ? { inputSchema: record.inputSchema } : {}),
        ...(record.outputSchema !== undefined ? { outputSchema: record.outputSchema } : {}),
      }
  }

  return {
    search,
    describe: (id) => {
      const record = byToolId.get(id)
      return record ? toDescription(record) : null
    },
    schema,
    schemas: (input = {}) => records
      .filter((record) => input.namespace === undefined || record.namespace === input.namespace)
      .map((record) => schema(toolId(record)))
      .filter((item): item is HarborLocalToolSchema => item !== null),
    call: async (input) => {
      const record = byToolId.get(input.toolId)
      if (!record) throw new Error(`Unknown local tool: ${input.toolId}`)
      if (!options.callTool) throw new Error("Local tool call handler is not configured")
      return await options.callTool(input, toDescription(record))
    },
  }
}
