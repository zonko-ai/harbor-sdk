import { mkdtemp, readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, expect, it } from "bun:test"
import {
  ensureHarborLocalProject,
  harborLocalPaths,
  HARBOR_LOCAL_DIR,
  LOCAL_WORKSPACE_ID,
  type HarborRegistryDevRefsFile,
} from "../src/index"

async function withTempProject<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "hrbr-runtime-local-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("@hrbr/runtime-local project layout", () => {
  it("creates the local .harbor layout and protects it with .gitignore", async () => {
    await withTempProject(async (projectRoot) => {
      const result = await ensureHarborLocalProject({ projectRoot })
      const paths = harborLocalPaths(projectRoot)

      expect(result.workspaceId).toBe(LOCAL_WORKSPACE_ID)
      expect(result.paths).toEqual(paths)
      expect(result.gitignoreUpdated).toBe(true)

      const gitignore = await readFile(join(projectRoot, ".gitignore"), "utf8")
      expect(gitignore).toContain(`${HARBOR_LOCAL_DIR}/`)

      const refs = JSON.parse(await readFile(paths.registryRefs, "utf8")) as HarborRegistryDevRefsFile
      expect(refs).toEqual({ version: 1, workspaceId: "local", refs: [] })

      await expect(readFile(paths.artifacts, "utf8")).rejects.toThrow()
      await expect(readFile(paths.traces, "utf8")).rejects.toThrow()
      await expect(readFile(paths.cache, "utf8")).rejects.toThrow()
    })
  })

  it("is idempotent and does not duplicate .gitignore entries", async () => {
    await withTempProject(async (projectRoot) => {
      const first = await ensureHarborLocalProject({ projectRoot })
      const second = await ensureHarborLocalProject({ projectRoot })

      expect(first.gitignoreUpdated).toBe(true)
      expect(second.gitignoreUpdated).toBe(false)

      const gitignore = await readFile(join(projectRoot, ".gitignore"), "utf8")
      expect(gitignore.match(/\.harbor\//g)).toHaveLength(1)
    })
  })
})
