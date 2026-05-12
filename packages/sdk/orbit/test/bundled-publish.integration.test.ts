// Integration tests for the bundled publish chain.
//
// Exercises publish-body schemas and the interlock between bundler output and
// the schema's bundle struct. Frontend showcase sources are intentionally not
// part of the SDK test surface.
//
// No live deploy. No Cloudflare. No credentials.

import { describe, expect, it } from 'bun:test'
import { Schema } from 'effect'

import { bundleOrbitSource, OrbitBundleError } from '../src/bundler'
import { OrbitAppPublishBody, OrbitAppPublishBundle } from '../src/apps'
import { OrbitJobPublishBody, OrbitJobPublishBundle } from '../src/jobs'

// Real v4 UUID with the proper version+variant nibbles.
const TEST_WORKSPACE_ID = '00000000-0000-4000-8000-000000000001'

const baseAppPublishBody = {
  workspace_id: TEST_WORKSPACE_ID,
  name: 'feedback-board',
  code: 'export default {}',
  routes: [],
  jobs: {},
}

const baseJobPublishBody = {
  workspace_id: TEST_WORKSPACE_ID,
  name: 'feedback-triage-report',
  code: 'export default {}',
  capabilities: ['storage', 'ai'] as const,
  input_schema: { type: 'object', properties: {} },
  output_schema: { type: 'object', properties: {} },
  policy: { timeout_ms: 60_000, retention_days: 30, idempotency: 'none' as const },
}

describe('bundled publish: bundler guardrails', () => {
  it('bundles SDK-only app source', async () => {
    const result = await bundleOrbitSource({
      kind: 'app',
      source: `import { defineOrbitApp } from "@hrbr/orbit/apps"
export default defineOrbitApp({
  name: "report",
  routes: [{ method: "GET", path: "/", auth: "public", input: "none", output: "json", job: "render" }],
  jobs: { render: { name: "render" } },
})`,
      minify: true,
      metafile: true,
    })

    expect(result.runtime).toBe('bundled')
    expect(result.kind).toBe('app')
    expect(result.code.length).toBeGreaterThan(100)
    expect(result.bytes).toBeGreaterThan(0)
    expect(result.gzip_bytes).toBeGreaterThan(0)
    expect(result.gzip_bytes).toBeLessThan(1024 * 1024)
    expect(result.code).not.toMatch(/^import\s+.+from\s+["']@hrbr\/orbit/m)
  })

  it('bundles SDK-only job source', async () => {
    const result = await bundleOrbitSource({
      kind: 'job',
      source: `import { defineOrbitJob } from "@hrbr/orbit/jobs"
export default defineOrbitJob({ name: "summarize", handler: async () => ({ ok: true }) })`,
      minify: true,
    })

    expect(result.runtime).toBe('bundled')
    expect(result.kind).toBe('job')
    expect(result.code.length).toBeGreaterThan(100)
    expect(result.gzip_bytes).toBeLessThan(1024 * 1024)
    expect(result.code).not.toMatch(/^import\s+.+from\s+["']@hrbr\/orbit/m)
  })

  it('rejects frontend app-ui imports', async () => {
    await expect(
      bundleOrbitSource({
        kind: 'app',
        source: `import { render } from "@hrbr/orbit/app-ui"
export default { render }`,
      }),
    ).rejects.toBeInstanceOf(OrbitBundleError)
  })

  it('rejects sources with node:fs imports', async () => {
    await expect(
      bundleOrbitSource({
        kind: 'app',
        source: `import { readFileSync } from "node:fs"
export default { value: readFileSync }`,
      }),
    ).rejects.toBeInstanceOf(OrbitBundleError)
  })

  it('rejects non-allowlisted package imports', async () => {
    await expect(
      bundleOrbitSource({
        kind: 'app',
        source: `import React from "react"
export default { value: React }`,
      }),
    ).rejects.toBeInstanceOf(OrbitBundleError)
  })
})

describe('bundled publish: schema decode', () => {
  const decodeApp = Schema.decodeUnknownSync(OrbitAppPublishBody)
  const decodeJob = Schema.decodeUnknownSync(OrbitJobPublishBody)
  const decodeAppBundle = Schema.decodeUnknownSync(OrbitAppPublishBundle)
  const decodeJobBundle = Schema.decodeUnknownSync(OrbitJobPublishBundle)

  const validBundle = {
    code: 'export default {}',
    hash: 'a'.repeat(64),
    bytes: 42,
  }

  it('OrbitAppPublishBundle decodes minimum valid bundle', () => {
    expect(() => decodeAppBundle(validBundle)).not.toThrow()
  })

  it('OrbitAppPublishBundle decodes with optional sourcemap', () => {
    expect(() =>
      decodeAppBundle({ ...validBundle, sourcemap: '{"version":3,"sources":[]}' }),
    ).not.toThrow()
  })

  it('OrbitAppPublishBundle rejects empty code', () => {
    expect(() => decodeAppBundle({ ...validBundle, code: '' })).toThrow()
  })

  it('OrbitAppPublishBundle rejects missing hash', () => {
    const { hash: _hash, ...bad } = validBundle
    expect(() => decodeAppBundle(bad)).toThrow()
  })

  it('OrbitJobPublishBundle decodes the same shape', () => {
    expect(() => decodeJobBundle(validBundle)).not.toThrow()
  })

  it('OrbitAppPublishBody accepts runtime=bundled with bundle present', () => {
    expect(() =>
      decodeApp({
        ...baseAppPublishBody,
        runtime: 'bundled',
        bundle: validBundle,
      }),
    ).not.toThrow()
  })

  it('OrbitAppPublishBody accepts runtime=classic with no bundle', () => {
    expect(() => decodeApp({ ...baseAppPublishBody, runtime: 'classic' })).not.toThrow()
  })

  it('OrbitAppPublishBody accepts the body with runtime omitted', () => {
    expect(() => decodeApp(baseAppPublishBody)).not.toThrow()
  })

  it('OrbitAppPublishBody rejects an unknown runtime literal', () => {
    expect(() =>
      decodeApp({ ...baseAppPublishBody, runtime: 'turbo' }),
    ).toThrow()
  })

  it('OrbitJobPublishBody accepts runtime=bundled with bundle', () => {
    expect(() =>
      decodeJob({ ...baseJobPublishBody, runtime: 'bundled', bundle: validBundle }),
    ).not.toThrow()
  })

  it('OrbitJobPublishBody rejects bundle with malformed bytes', () => {
    expect(() =>
      decodeJob({
        ...baseJobPublishBody,
        runtime: 'bundled',
        bundle: { ...validBundle, bytes: 'a-lot' as unknown as number },
      }),
    ).toThrow()
  })
})

describe('bundled publish: bundler output flows into schema', () => {
  it('app bundler output fits OrbitAppPublishBundle', async () => {
    const result = await bundleOrbitSource({
      kind: 'app',
      source: `import { defineOrbitApp } from "@hrbr/orbit/apps"
export default defineOrbitApp({
  name: "report",
  routes: [{ method: "GET", path: "/", auth: "public", input: "none", output: "json", job: "render" }],
  jobs: { render: { name: "render" } },
})`,
      minify: true,
    })

    const bundle = {
      code: result.code,
      sourcemap: result.sourcemap,
      hash: hashLike(result.code),
      bytes: result.bytes,
    }
    expect(() => Schema.decodeUnknownSync(OrbitAppPublishBundle)(bundle)).not.toThrow()
  })

  it('job bundler output fits OrbitJobPublishBundle', async () => {
    const result = await bundleOrbitSource({
      kind: 'job',
      source: `import { defineOrbitJob } from "@hrbr/orbit/jobs"
export default defineOrbitJob({ name: "summarize", handler: async () => ({ ok: true }) })`,
      minify: true,
    })

    const bundle = {
      code: result.code,
      sourcemap: result.sourcemap,
      hash: hashLike(result.code),
      bytes: result.bytes,
    }
    expect(() => Schema.decodeUnknownSync(OrbitJobPublishBundle)(bundle)).not.toThrow()
  })
})

// Tiny deterministic 64-char hex value mimicking what the publish path
// computes from the bundle code. We use this only to satisfy the schema's
// non-empty hash field; the real hash is computed elsewhere.
function hashLike(value: string): string {
  let acc = 0
  for (let i = 0; i < value.length; i += 1) acc = (acc * 31 + value.charCodeAt(i)) | 0
  const seed = (acc >>> 0).toString(16)
  return seed.padEnd(64, '0').slice(0, 64)
}
