import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitAiModelTask: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
type OrbitAiModelTask = typeof OrbitAiModelTask.Type;
declare const OrbitAiModel: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly task: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
  readonly provider: Schema.optional<Schema.String>;
  readonly fast: Schema.optional<Schema.Boolean>;
  readonly reasoning: Schema.optional<Schema.Boolean>;
  readonly vision: Schema.optional<Schema.Boolean>;
}>;
type OrbitAiModel = typeof OrbitAiModel.Type;
declare const OrbitAiModelsResultInfo: Schema.Struct<{
  readonly count: Schema.optional<Schema.Number>;
  readonly page: Schema.optional<Schema.Number>;
  readonly per_page: Schema.optional<Schema.Number>;
  readonly total_count: Schema.optional<Schema.Number>;
  readonly total_pages: Schema.optional<Schema.Number>;
}>;
type OrbitAiModelsResultInfo = typeof OrbitAiModelsResultInfo.Type;
declare const OrbitAiModelsResponse: Schema.Struct<{
  readonly models: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly task: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
    readonly provider: Schema.optional<Schema.String>;
    readonly fast: Schema.optional<Schema.Boolean>;
    readonly reasoning: Schema.optional<Schema.Boolean>;
    readonly vision: Schema.optional<Schema.Boolean>;
  }>>;
  readonly workspace_allowed: Schema.optional<Schema.NullOr<Schema.$Array<Schema.String>>>;
  readonly source: Schema.optional<Schema.String>;
  readonly fallback_reason: Schema.optional<Schema.String>;
  readonly result_info: Schema.optional<Schema.Struct<{
    readonly count: Schema.optional<Schema.Number>;
    readonly page: Schema.optional<Schema.Number>;
    readonly per_page: Schema.optional<Schema.Number>;
    readonly total_count: Schema.optional<Schema.Number>;
    readonly total_pages: Schema.optional<Schema.Number>;
  }>>;
}>;
type OrbitAiModelsResponse = typeof OrbitAiModelsResponse.Type;
declare const OrbitAiTextOptions: Schema.Struct<{
  readonly model: Schema.optional<Schema.String>;
  readonly temperature: Schema.optional<Schema.Number>;
  readonly max_tokens: Schema.optional<Schema.Number>;
}>;
type OrbitAiTextOptions = typeof OrbitAiTextOptions.Type;
declare const OrbitAiRunArgs: Schema.Struct<{
  readonly model: Schema.optional<Schema.String>;
  readonly input: Schema.Unknown;
  readonly temperature: Schema.optional<Schema.Number>;
  readonly max_tokens: Schema.optional<Schema.Number>;
}>;
type OrbitAiRunArgs = typeof OrbitAiRunArgs.Type;
declare const OrbitAiTextResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly text: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiTextResponse = typeof OrbitAiTextResponse.Type;
declare const OrbitAiSummaryResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly summary: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiSummaryResponse = typeof OrbitAiSummaryResponse.Type;
declare const OrbitAiEmbedResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly embeddings: Schema.$Array<Schema.$Array<Schema.Number>>;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiEmbedResponse = typeof OrbitAiEmbedResponse.Type;
declare const OrbitAiClassifyResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly label: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiClassifyResponse = typeof OrbitAiClassifyResponse.Type;
declare const OrbitAiRerankResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly ranking: Schema.Unknown;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiRerankResponse = typeof OrbitAiRerankResponse.Type;
//#endregion
export { OrbitAiClassifyResponse, OrbitAiEmbedResponse, OrbitAiModel, OrbitAiModelTask, OrbitAiModelsResponse, OrbitAiModelsResultInfo, OrbitAiRerankResponse, OrbitAiRunArgs, OrbitAiSummaryResponse, OrbitAiTextOptions, OrbitAiTextResponse };
//# sourceMappingURL=ai.d.mts.map