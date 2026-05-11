import { describe, expect, it } from "bun:test"
import type { WorkspaceReader } from "../src/index"

describe("@hrbr/workspaces contracts", () => {
  it("allows hosted and platform implementations to share a workspace reader", async () => {
    const reader: WorkspaceReader = {
      list: async () => ({
        data: [{
          id: "11111111-1111-4111-8111-111111111111",
          name: "Demo",
          slug: "demo",
          role: "owner",
          onboarded_at: null,
        }],
        limit: 50,
        offset: 0,
        hasMore: false,
      }),
      get: async ({ workspaceId }) => ({
        id: workspaceId,
        name: "Demo",
        slug: "demo",
        role: "owner",
        onboarded_at: null,
      }),
    }

    await expect(reader.list()).resolves.toMatchObject({ hasMore: false })
    await expect(reader.get({ workspaceId: "11111111-1111-4111-8111-111111111111" })).resolves.toMatchObject({
      slug: "demo",
    })
  })
})
