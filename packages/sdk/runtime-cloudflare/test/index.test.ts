import { describe, expect, it } from "bun:test"
import {
  applyCloudflareProvisioningPlan,
  cloudflareCredentialEnvImportConfig,
  createCloudflareOrbitAdapters,
  createCloudflareProvisioningPlan,
  createCloudflareRuntimeAdapter,
  CLOUDFLARE_CREDENTIAL_ENV,
} from "../src/index"

describe("@hrbr/runtime-cloudflare", () => {
  it("routes plan, status, and confirmed apply through the local daemon", async () => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = []
    const adapter = createCloudflareRuntimeAdapter({
      account: { accountId: "acct-1", accountName: "Acme" },
      connection: {
        origin: "http://127.0.0.1:7331/",
        headers: { authorization: "Bearer local" },
      },
      desiredResources: [{ kind: "r2_bucket", name: "harbor-artifacts" }],
      fetch: async (url, init) => {
        calls.push({ url: String(url), init })
        if (String(url).endsWith("/plan")) {
          return Response.json({
            account: { accountId: "acct-1", accountName: "Acme" },
            items: [],
            requiresConfirmation: false,
          })
        }
        if (String(url).endsWith("/status")) {
          return Response.json({
            account: { accountId: "acct-1", accountName: "Acme" },
            resources: [],
            updatedAt: "2026-05-12T00:00:00.000Z",
          })
        }
        return Response.json({
          account: { accountId: "acct-1", accountName: "Acme" },
          resources: [{ kind: "r2_bucket", name: "harbor-artifacts" }],
          updatedAt: "2026-05-12T00:00:00.000Z",
        })
      },
    })

    await expect(adapter.plan()).resolves.toMatchObject({ account: { accountId: "acct-1" } })
    await expect(adapter.status()).resolves.toMatchObject({ updatedAt: "2026-05-12T00:00:00.000Z" })
    await expect(adapter.apply({ confirmed: true })).resolves.toMatchObject({
      resources: [{ kind: "r2_bucket", name: "harbor-artifacts" }],
    })

    expect(calls.map((call) => call.url)).toEqual([
      "http://127.0.0.1:7331/control/cloudflare/plan",
      "http://127.0.0.1:7331/control/cloudflare/status",
      "http://127.0.0.1:7331/control/cloudflare/apply",
    ])
    expect(calls[0].init?.headers).toMatchObject({ authorization: "Bearer local" })
  })

  it("requires confirmation for mutations and exposes env import slots", async () => {
    const adapter = createCloudflareRuntimeAdapter({
      account: { accountId: "acct-1" },
      connection: { origin: "http://127.0.0.1:7331", headers: {} },
      desiredResources: [],
      fetch: async () => Response.json(null),
    })

    await expect(adapter.apply({ confirmed: false })).rejects.toThrow("requires confirmation")
    expect(cloudflareCredentialEnvImportConfig()).toEqual({
      sourceRefId: "cloudflare",
      slots: {
        api_token: CLOUDFLARE_CREDENTIAL_ENV.apiToken,
        account_id: CLOUDFLARE_CREDENTIAL_ENV.accountId,
      },
    })
  })

  it("plans create/noop/delete changes and applies them into a lock", async () => {
    const plan = createCloudflareProvisioningPlan({
      account: { accountId: "acct-1" },
      desiredResources: [
        { kind: "r2_bucket", name: "artifacts" },
        { kind: "kv_namespace", name: "cache", id: "kv-1" },
      ],
      currentLock: {
        account: { accountId: "acct-1" },
        resources: [
          { kind: "kv_namespace", name: "cache", id: "kv-1" },
          { kind: "d1_database", name: "old-db", id: "d1-old" },
        ],
        updatedAt: "2026-05-11T00:00:00.000Z",
      },
    })

    expect(plan).toMatchObject({
      requiresConfirmation: true,
      items: [
        { action: "create", resource: { kind: "r2_bucket", name: "artifacts" }, destructive: false },
        { action: "noop", resource: { kind: "kv_namespace", name: "cache", id: "kv-1" }, destructive: false },
        { action: "delete", resource: { kind: "d1_database", name: "old-db", id: "d1-old" }, destructive: true },
      ],
    })
    await expect(applyCloudflareProvisioningPlan({ plan, confirmed: false })).rejects.toThrow("requires confirmation")

    const deleted: string[] = []
    await expect(applyCloudflareProvisioningPlan({
      plan,
      confirmed: true,
      now: () => new Date("2026-05-12T00:00:00.000Z"),
      client: {
        createResource: (resource) => ({ ...resource, id: `${resource.kind}-created` }),
        deleteResource: (resource) => {
          deleted.push(resource.name)
        },
      },
    })).resolves.toEqual({
      account: { accountId: "acct-1" },
      resources: [
        { kind: "r2_bucket", name: "artifacts", id: "r2_bucket-created" },
        { kind: "kv_namespace", name: "cache", id: "kv-1" },
      ],
      updatedAt: "2026-05-12T00:00:00.000Z",
    })
    expect(deleted).toEqual(["old-db"])
  })

  it("maps Orbit adapter calls onto configured Cloudflare resources", async () => {
    const calls: string[] = []
    const orbit = createCloudflareOrbitAdapters({
      resources: [
        { kind: "r2_bucket", name: "artifacts" },
        { kind: "kv_namespace", name: "cache" },
        { kind: "d1_database", name: "workspace-db" },
        { kind: "worker", name: "apps-worker" },
        { kind: "ai_gateway", name: "gateway" },
      ],
      client: {
        r2: {
          get: (bucket, key) => {
            calls.push(`r2.get:${bucket}:${key}`)
            return "object"
          },
          put: (bucket, key, value) => {
            calls.push(`r2.put:${bucket}:${key}:${value}`)
            return { ok: true }
          },
        },
        kv: {
          get: (namespace, key) => {
            calls.push(`kv.get:${namespace}:${key}`)
            return "cached"
          },
          put: (namespace, key, value) => {
            calls.push(`kv.put:${namespace}:${key}:${value}`)
            return { ok: true }
          },
        },
        d1: {
          query: (database, statement) => {
            calls.push(`d1.query:${database}:${statement}`)
            return { rows: [] }
          },
        },
        worker: {
          fetch: (worker, path) => {
            calls.push(`worker.fetch:${worker}:${path}`)
            return { status: 200 }
          },
        },
        ai: {
          run: (gateway, model) => {
            calls.push(`ai.run:${gateway}:${model}`)
            return { text: "ok" }
          },
        },
      },
    })

    await expect(orbit.storage.get("report.txt")).resolves.toBe("object")
    await expect(orbit.storage.put("report.txt", "data")).resolves.toEqual({ ok: true })
    await expect(orbit.cache.get("k")).resolves.toBe("cached")
    await expect(orbit.cache.set("k", "v")).resolves.toEqual({ ok: true })
    await expect(orbit.db.query("select 1")).resolves.toEqual({ rows: [] })
    await expect(orbit.jobs.run("/jobs/echo", { ok: true })).resolves.toEqual({ status: 200 })
    await expect(orbit.apps.fetch("/apps/hello")).resolves.toEqual({ status: 200 })
    await expect(orbit.ai.run("@cf/meta/llama", "hi")).resolves.toEqual({ text: "ok" })
    expect(calls).toEqual([
      "r2.get:artifacts:report.txt",
      "r2.put:artifacts:report.txt:data",
      "kv.get:cache:k",
      "kv.put:cache:k:v",
      "d1.query:workspace-db:select 1",
      "worker.fetch:apps-worker:/jobs/echo",
      "worker.fetch:apps-worker:/apps/hello",
      "ai.run:gateway:@cf/meta/llama",
    ])
  })
})
