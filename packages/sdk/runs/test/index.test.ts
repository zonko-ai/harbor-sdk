import { describe, expect, it } from "bun:test"
import { createMemoryTraceWriter } from "../src/index"
import type { Run, RunReader } from "../src/index"

function run(overrides: Partial<Run> = {}): Run {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    workspace_id: "22222222-2222-4222-8222-222222222222",
    agent_id: "33333333-3333-4333-8333-333333333333",
    status: "completed",
    source: "cli",
    trigger: "exec",
    error_message: null,
    error_code: null,
    exit_code: null,
    duration_ms: 12,
    artifact_count: 0,
    started_at: "2026-01-01T00:00:00.000Z",
    finished_at: "2026-01-01T00:00:00.012Z",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("@hrbr/runs contracts", () => {
  it("allows hosted and platform implementations to share a run reader", async () => {
    const reader: RunReader = {
      list: async () => ({ data: [run()], limit: 50, offset: 0, hasMore: false }),
      get: async ({ runId }) => run({ id: runId }),
      graph: async ({ runId }) => ({
        run: run({ id: runId }),
        spans: [],
        next_cursor: null,
        summary: {
          span_count: 0,
          error_count: 0,
          retry_count: 0,
          total_tokens_in: null,
          total_tokens_out: null,
          total_cost_usd: null,
        },
      }),
    }

    await expect(reader.list()).resolves.toMatchObject({ hasMore: false })
    await expect(reader.graph({ runId: "11111111-1111-4111-8111-111111111111" })).resolves.toMatchObject({
      next_cursor: null,
    })
  })

  it("writes local run graphs with in-memory traces", async () => {
    let tick = 0
    const trace = createMemoryTraceWriter({
      id: () => `id-${++tick}`,
      now: () => new Date(`2026-01-01T00:00:0${Math.min(tick, 9)}.000Z`),
    })

    const run = await trace.startRun({ trigger: "sdk-test", input: { ok: true } })
    const span = await trace.startSpan({
      runId: run.id,
      kind: "mcp.tool_call",
      title: "Call demo tool",
      sourceNamespace: "demo",
      toolId: "demo.echo",
      toolName: "echo",
      input: { value: 1 },
    })
    await trace.finishSpan({ spanId: span.id, status: "success", output: { value: 1 } })
    await trace.finishRun({ runId: run.id, status: "completed", output: { done: true } })

    await expect(trace.graph(run.id)).resolves.toMatchObject({
      run: { id: "id-1", status: "completed" },
      spans: [{ id: "id-2", status: "success", tool_id: "demo.echo" }],
      summary: { span_count: 1, error_count: 0 },
    })
  })
})
