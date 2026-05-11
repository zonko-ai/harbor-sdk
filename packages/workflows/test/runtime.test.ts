import { describe, expect, it } from "bun:test"
import { createMemoryTraceWriter } from "@hrbr/runs"
import { defineSourceAdapter } from "@hrbr/source-core"
import { createToolRegistry } from "@hrbr/tools"
import { defineWorkflow, runWorkflow } from "../src/index"

describe("@hrbr/workflows runtime", () => {
  it("runs step.do and tool calls with shared trace evidence", async () => {
    let tick = 0
    const traces = createMemoryTraceWriter({
      id: () => `wf-${++tick}`,
      now: () => new Date(`2026-01-01T00:00:0${Math.min(tick, 9)}.000Z`),
    })
    const tools = createToolRegistry({
      traces,
      sources: [
        defineSourceAdapter({
          namespace: "tickets",
          displayName: "Tickets",
          listTools: async () => [{ name: "create", displayName: "Create ticket" }],
          invokeTool: async (_name, input) => ({ id: "ticket-1", title: input["title"] }),
        }),
      ],
    })
    const workflow = defineWorkflow({
      name: "triage-ticket",
      run: async ({ input, step, tools }) => {
        const title = await step.do("normalize title", () => String(input["title"]).trim())
        const created = await step.do("create ticket", () =>
          tools.call("tickets.create", { title }),
        )
        return { created: created.result }
      },
    })

    const result = await runWorkflow(workflow, {
      input: { title: " Login broken " },
      tools,
      traces,
    })

    expect(result.runId).toBe("wf-1")
    await expect(traces.graph("wf-1")).resolves.toMatchObject({
      run: { status: "completed" },
      spans: [
        { kind: "workflow.step", title: "normalize title", status: "success" },
        { kind: "workflow.step", title: "create ticket", status: "success" },
        { kind: "mcp.tool_call", tool_id: "tickets.create", status: "success" },
      ],
      summary: { span_count: 3, error_count: 0 },
    })
  })

  it("runs retries, sleep, and waitForEvent through backend hooks with trace evidence", async () => {
    let tick = 0
    let attempts = 0
    const slept: string[] = []
    const traces = createMemoryTraceWriter({
      id: () => `wf-step-${++tick}`,
      now: () => new Date(`2026-01-01T00:00:0${Math.min(tick, 9)}.000Z`),
    })
    const tools = createToolRegistry({ sources: [] })
    const workflow = defineWorkflow({
      name: "approval-flow",
      run: async ({ step }) => {
        const value = await step.do("unstable", { retries: { maxAttempts: 2 } }, () => {
          attempts += 1
          if (attempts === 1) throw new Error("try again")
          return "ok"
        })
        await step.sleep("cool down", "5s")
        const event = await step.waitForEvent<{ approved: boolean }>("approval", {
          type: "approval_received",
          timeout: "1m",
        })
        return { value, event }
      },
    })

    const result = await runWorkflow(workflow, {
      input: {},
      tools,
      traces,
      stepBackend: {
        sleep: async (name, duration) => {
          slept.push(`${name}:${duration}`)
        },
        waitForEvent: async (_name, options) => ({ approved: options.type === "approval_received" }),
      },
    })

    expect(result.output).toEqual({ value: "ok", event: { approved: true } })
    expect(attempts).toBe(2)
    expect(slept).toEqual(["cool down:5s"])
    await expect(traces.graph("wf-step-1")).resolves.toMatchObject({
      run: { status: "completed" },
      spans: [
        { kind: "workflow.step", title: "unstable", status: "success" },
        { kind: "retry", title: "Retry unstable", status: "warning" },
        { kind: "workflow.sleep", title: "cool down", status: "success" },
        { kind: "workflow.wait_event", title: "approval", status: "success" },
      ],
      summary: { span_count: 4, error_count: 0, retry_count: 1 },
    })
  })

  it("rejects invalid waitForEvent event types before calling the backend", async () => {
    let called = false
    const tools = createToolRegistry({ sources: [] })
    const workflow = defineWorkflow({
      name: "invalid-event",
      run: ({ step }) =>
        step.waitForEvent("bad event", {
          type: "approval.received",
        }),
    })

    await expect(
      runWorkflow(workflow, {
        input: {},
        tools,
        stepBackend: {
          waitForEvent: async () => {
            called = true
            return {}
          },
        },
      }),
    ).rejects.toThrow("step.waitForEvent options.type must match")
    expect(called).toBe(false)
  })

  it("treats local timeout as terminal and exposes an abort signal", async () => {
    const attempts: Array<{ attempt: number; aborted: boolean }> = []
    const tools = createToolRegistry({ sources: [] })
    const workflow = defineWorkflow({
      name: "timeout-flow",
      run: ({ step }) =>
        step.do("timeout", { retries: { maxAttempts: 3 }, timeoutMs: 1 }, async ({ attempt, signal }) => {
          attempts.push({ attempt, aborted: signal.aborted })
          await new Promise((resolve) => setTimeout(resolve, 20))
          attempts.push({ attempt, aborted: signal.aborted })
          return "late"
        }),
    })

    await expect(runWorkflow(workflow, { input: {}, tools })).rejects.toThrow("timed out")
    expect(attempts[0]).toEqual({ attempt: 1, aborted: false })
    expect(attempts).toHaveLength(1)
  })
})
