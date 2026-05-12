import { watch, watchFile, unwatchFile, type FSWatcher } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { isAbsolute, join } from "node:path"
import {
  harborLocalPaths,
  LOCAL_WORKSPACE_ID,
  type HarborRegistryDevRef,
  type HarborRegistryDevRefsFile,
} from "./index"

export interface HarborRegistryDevRefInput {
  readonly kind: HarborRegistryDevRef["kind"]
  readonly path: string
  readonly name?: string | undefined
}

export interface HarborRegistryWatchEvent {
  readonly ref: HarborRegistryDevRef
  readonly event: "change" | "rename"
  readonly filename?: string | undefined
}

export interface HarborRegistryWatcher {
  readonly close: () => void
}

function emptyRefs(): HarborRegistryDevRefsFile {
  return { version: 1, workspaceId: LOCAL_WORKSPACE_ID, refs: [] }
}

function refKey(ref: Pick<HarborRegistryDevRef, "kind" | "path">): string {
  return `${ref.kind}:${ref.path}`
}

function absoluteRefPath(projectRoot: string, path: string): string {
  return isAbsolute(path) ? path : join(projectRoot, path)
}

export async function readHarborRegistryDevRefs(
  projectRoot: string
): Promise<HarborRegistryDevRefsFile> {
  const paths = harborLocalPaths(projectRoot)
  try {
    return JSON.parse(await readFile(paths.registryRefs, "utf8")) as HarborRegistryDevRefsFile
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyRefs()
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid local registry refs JSON at ${paths.registryRefs}. Restore the file from backup or delete it and run hrbr_local action=bootstrap to recreate an empty registry.`)
    }
    throw error
  }
}

export async function writeHarborRegistryDevRefs(
  projectRoot: string,
  file: HarborRegistryDevRefsFile
): Promise<void> {
  const paths = harborLocalPaths(projectRoot)
  await writeFile(paths.registryRefs, `${JSON.stringify(file, null, 2)}\n`)
}

export async function upsertHarborRegistryDevRef(
  projectRoot: string,
  input: HarborRegistryDevRefInput
): Promise<HarborRegistryDevRefsFile> {
  const current = await readHarborRegistryDevRefs(projectRoot)
  const nextRef: HarborRegistryDevRef =
    input.name === undefined
      ? { kind: input.kind, path: input.path }
      : { kind: input.kind, path: input.path, name: input.name }
  const refs = new Map(current.refs.map((ref) => [refKey(ref), ref]))
  refs.set(refKey(nextRef), nextRef)
  const next = { ...current, refs: [...refs.values()].sort((a, b) => refKey(a).localeCompare(refKey(b))) }
  await writeHarborRegistryDevRefs(projectRoot, next)
  return next
}

export async function removeHarborRegistryDevRef(
  projectRoot: string,
  input: Pick<HarborRegistryDevRefInput, "kind" | "path">
): Promise<HarborRegistryDevRefsFile> {
  const current = await readHarborRegistryDevRefs(projectRoot)
  const key = refKey(input)
  const next = { ...current, refs: current.refs.filter((ref) => refKey(ref) !== key) }
  await writeHarborRegistryDevRefs(projectRoot, next)
  return next
}

export async function watchHarborRegistryDevRefs(
  projectRoot: string,
  onEvent: (event: HarborRegistryWatchEvent) => void
): Promise<HarborRegistryWatcher> {
  const refs = await readHarborRegistryDevRefs(projectRoot)
  const watchers: FSWatcher[] = []
  const watchedFiles: string[] = []
  for (const ref of refs.refs) {
    const target = absoluteRefPath(projectRoot, ref.path)
    if (!ref.path.endsWith("/")) {
      watchedFiles.push(target)
      watchFile(target, { interval: 50 }, (current, previous) => {
        if (current.mtimeMs === previous.mtimeMs && current.size === previous.size) return
        onEvent({ ref, event: "change", filename: target.split(/[\\/]/).pop() })
      })
      continue
    }
    watchers.push(
      watch(target, (event, filename) => {
        const name = typeof filename === "string" ? filename : undefined
        onEvent({
          ref,
          event: event === "rename" ? "rename" : "change",
          ...(name !== undefined ? { filename: name } : {}),
        })
      })
    )
  }
  return {
    close: () => {
      for (const watcher of watchers) watcher.close()
      for (const file of watchedFiles) unwatchFile(file)
    },
  }
}
