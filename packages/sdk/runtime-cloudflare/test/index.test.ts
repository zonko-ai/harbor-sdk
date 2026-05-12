import { describe, expect, it } from "bun:test"
import {
  applyCloudflareProvisioningPlan,
  cloudflareCredentialEnvImportConfig,
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
})
