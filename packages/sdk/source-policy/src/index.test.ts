import { describe, expect, it } from "bun:test"
import { getCatalogEntry, listCatalogEntries } from "@hrbr/catalog"
import {
  createToolPolicy,
  ToolPolicyDeniedError,
  compileSourcePolicy,
} from "./index"

describe("source policy compatibility compiler", () => {
  it("compiles every catalog entry into a provider-agnostic policy", () => {
    for (const entry of listCatalogEntries()) {
      const policy = compileSourcePolicy(entry)

      expect(policy.identity.slug).toBe(entry.slug)
      expect(policy.identity.kind).toBe(entry.kind)
      expect(policy.identity.default_namespace).toBe(entry.default_namespace)
      expect(policy.exposure.status === "active" || policy.exposure.status === "coming_soon").toBe(true)
      expect(policy.diagnostics[0]?.phase).toBe("catalog")
    }
  })

  it("keeps curation decisions explainable", () => {
    const stopped = getCatalogEntry("x-api")
    expect(stopped).toBeTruthy()

    const policy = compileSourcePolicy(stopped!)
    expect(policy.exposure.status).toBe("coming_soon")
    expect(policy.exposure.code).toBe("known_broken")
    expect(policy.diagnostics.length).toBeGreaterThan(1)
    expect(policy.diagnostics[0]?.phase).toBe("catalog")
  })

  it("applies duplicate-kind curation with survivor guidance", () => {
    const stopped = getCatalogEntry("figma-mcp")
    const survivor = getCatalogEntry("figma-api")
    expect(stopped).toBeTruthy()
    expect(survivor).toBeTruthy()

    const stoppedPolicy = compileSourcePolicy(stopped!)
    expect(stoppedPolicy.exposure.status).toBe("coming_soon")
    expect(stoppedPolicy.exposure.code).toBe("superseded_by_kind")
    expect(stoppedPolicy.exposure.superseded_by).toBe("figma-api")
    expect(stoppedPolicy.exposure.reason ?? "").toContain("figma-api")

    const survivorPolicy = compileSourcePolicy(survivor!)
    expect(survivorPolicy.exposure.status).toBe("active")
  })

  it("selects policy setup slots for curated OAuth classes", () => {
    const manual = getCatalogEntry("airtable-mcp")
    const confidential = getCatalogEntry("hubspot-mcp")
    expect(manual).toBeTruthy()
    expect(confidential).toBeTruthy()

    const manualPolicy = compileSourcePolicy(manual!)
    expect(manualPolicy.setup.auth_kind).toBe("manual_client_oauth")
    expect(manualPolicy.setup.install_flow).toBe("manual_credentials")
    expect(manualPolicy.exposure.code).toBe("manual_oauth_setup")

    const confidentialPolicy = compileSourcePolicy(confidential!)
    expect(confidentialPolicy.setup.auth_kind).toBe("global_confidential_oauth")
    expect(confidentialPolicy.setup.install_flow).toBe("discover_then_auth")
    expect(confidentialPolicy.exposure.code).toBe("requires_client_secret")
  })

  it("evaluates runtime tool-call policy rules", async () => {
    const policy = createToolPolicy({
      rules: [
        { match: "tickets.delete", decision: { kind: "block", reason: "Deletes require admin workflow" } },
        { match: "tickets.*", decision: { kind: "allow" } },
      ],
    })

    await expect(Promise.resolve(policy.evaluate({
      toolId: "tickets.create",
      namespace: "tickets",
      toolName: "create",
      input: {},
    }))).resolves.toEqual({ kind: "allow" })

    await expect(Promise.resolve(policy.evaluate({
      toolId: "tickets.delete",
      namespace: "tickets",
      toolName: "delete",
      input: {},
    }))).resolves.toMatchObject({
      kind: "block",
      reason: "Deletes require admin workflow",
    })
  })

  it("exposes a typed policy denial error for registry integrations", () => {
    const error = new ToolPolicyDeniedError("tickets.delete", {
      kind: "block",
      reason: "Not allowed",
    })

    expect(error.toolId).toBe("tickets.delete")
    expect(error.message).toContain("Not allowed")
  })
})
