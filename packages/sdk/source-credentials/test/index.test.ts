import { describe, expect, it } from "bun:test"
import {
  createCredentialResolver,
  createMemoryCredentialStore,
  MissingCredentialError,
  type CredentialBinding,
} from "../src/index"

describe("@hrbr/source-credentials", () => {
  it("resolves active source credential bindings through secret refs", async () => {
    const binding: CredentialBinding = {
      workspace_id: "workspace-1",
      source_id: "source-1",
      slot: "api_key",
      scope: "workspace",
      value: { kind: "secret", secret_id: "secret-1" },
      status: "active",
    }
    const resolver = createCredentialResolver({
      store: createMemoryCredentialStore({ secrets: { "secret-1": "sk_test" } }),
      bindings: [binding],
    })

    const credentials = await resolver.resolve({
      workspaceId: "workspace-1",
      sourceId: "source-1",
    })

    expect(credentials.get("api_key")).toBe("sk_test")
    expect(credentials.slots()).toEqual(["api_key"])
  })

  it("keeps missing required credentials explicit", async () => {
    const resolver = createCredentialResolver({
      store: createMemoryCredentialStore(),
      bindings: [],
    })
    const credentials = await resolver.resolve({
      workspaceId: "workspace-1",
      sourceId: "source-1",
    })

    expect(() => credentials.require("api_key")).toThrow(MissingCredentialError)
  })
})
