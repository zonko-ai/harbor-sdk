// orbit.ai.* contracts: policy-scoped execution AI through Harbor, not raw provider bindings.
import { Schema } from "effect"

export const OrbitAiModelTask = Schema.Union([
  Schema.Literal("text-generation"),
  Schema.Literal("text-embeddings"),
  Schema.Literal("classification"),
  Schema.Literal("rerank"),
  Schema.Literal("summarization"),
])
export type OrbitAiModelTask = typeof OrbitAiModelTask.Type

export const OrbitAiModel = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  task: OrbitAiModelTask,
  provider: Schema.optional(Schema.String),
  fast: Schema.optional(Schema.Boolean),
  reasoning: Schema.optional(Schema.Boolean),
  vision: Schema.optional(Schema.Boolean),
})
export type OrbitAiModel = typeof OrbitAiModel.Type

export const OrbitAiModelsResultInfo = Schema.Struct({
  count: Schema.optional(Schema.Number),
  page: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
  total_count: Schema.optional(Schema.Number),
  total_pages: Schema.optional(Schema.Number),
})
export type OrbitAiModelsResultInfo = typeof OrbitAiModelsResultInfo.Type

export const OrbitAiModelsResponse = Schema.Struct({
  models: Schema.Array(OrbitAiModel),
  workspace_allowed: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  source: Schema.optional(Schema.String),
  fallback_reason: Schema.optional(Schema.String),
  result_info: Schema.optional(OrbitAiModelsResultInfo),
})
export type OrbitAiModelsResponse = typeof OrbitAiModelsResponse.Type

export const OrbitAiTextOptions = Schema.Struct({
  model: Schema.optional(Schema.String),
  temperature: Schema.optional(Schema.Number),
  max_tokens: Schema.optional(Schema.Number),
})
export type OrbitAiTextOptions = typeof OrbitAiTextOptions.Type

export const OrbitAiRunArgs = Schema.Struct({
  model: Schema.optional(Schema.String),
  input: Schema.Unknown,
  temperature: Schema.optional(Schema.Number),
  max_tokens: Schema.optional(Schema.Number),
})
export type OrbitAiRunArgs = typeof OrbitAiRunArgs.Type

export const OrbitAiTextResponse = Schema.Struct({
  model: Schema.String,
  text: Schema.String,
  raw: Schema.Unknown,
})
export type OrbitAiTextResponse = typeof OrbitAiTextResponse.Type

export const OrbitAiSummaryResponse = Schema.Struct({
  model: Schema.String,
  summary: Schema.String,
  raw: Schema.Unknown,
})
export type OrbitAiSummaryResponse = typeof OrbitAiSummaryResponse.Type

export const OrbitAiEmbedResponse = Schema.Struct({
  model: Schema.String,
  embeddings: Schema.Array(Schema.Array(Schema.Number)),
  raw: Schema.Unknown,
})
export type OrbitAiEmbedResponse = typeof OrbitAiEmbedResponse.Type

export const OrbitAiClassifyResponse = Schema.Struct({
  model: Schema.String,
  label: Schema.String,
  raw: Schema.Unknown,
})
export type OrbitAiClassifyResponse = typeof OrbitAiClassifyResponse.Type

export const OrbitAiRerankResponse = Schema.Struct({
  model: Schema.String,
  ranking: Schema.Unknown,
  raw: Schema.Unknown,
})
export type OrbitAiRerankResponse = typeof OrbitAiRerankResponse.Type
