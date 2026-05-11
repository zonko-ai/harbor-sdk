import { describe, expect, it } from 'bun:test'
import { bundleOrbitSource, OrbitBundleError } from '../src/bundler'

const appSource = `
import { Page, render, response } from "@hrbr/orbit/app-ui"

export default defineOrbitApp({
  name: "hello-app",
  routes: [{
    method: "GET",
    path: "/",
    auth: "public",
    input: "none",
    output: "html",
    job: "hello",
    render: () => response(Page({ title: "Hello" }, [])),
  }],
})
`

const jobSource = `
export default defineOrbitJob({
  async handler() {
    return { ok: true }
  },
})
`

describe('orbit bundler', () => {
  it('bundles Orbit app sources with @hrbr/orbit/app-ui imports', async () => {
    const result = await bundleOrbitSource({
      kind: 'app',
      source: appSource,
      resolveDir: process.cwd(),
      minify: false,
      metafile: true,
    })

    expect(result.runtime).toBe('bundled')
    expect(result.kind).toBe('app')
    expect(result.code).toContain('Hello')
    expect(result.gzip_bytes).toBeGreaterThan(0)
    expect(result.metafile).toBeDefined()
  })

  it('bundles Orbit job sources without app-ui', async () => {
    const result = await bundleOrbitSource({ kind: 'job', source: jobSource, minify: false })

    expect(result.kind).toBe('job')
    expect(result.code).toContain('ok')
  })

  it('allows app-ui imports from jobs (HTML artifact rendering)', async () => {
    const result = await bundleOrbitSource({
      kind: 'job',
      source: 'import { Page, render } from "@hrbr/orbit/app-ui"; export default { build: () => render(Page({ title: "hi" }, [])) }',
    })
    expect(result.kind).toBe('job')
    expect(result.code.length).toBeGreaterThan(50)
  })

  it('rejects Node built-in imports', async () => {
    await expect(bundleOrbitSource({
      kind: 'app',
      source: 'import { readFileSync } from "node:fs"; export default defineOrbitApp({ value: readFileSync })',
    })).rejects.toBeInstanceOf(OrbitBundleError)
  })

  it('rejects non-allowlisted package imports', async () => {
    await expect(bundleOrbitSource({
      kind: 'app',
      source: 'import React from "react"; export default defineOrbitApp({ value: React })',
    })).rejects.toBeInstanceOf(OrbitBundleError)
  })
})
