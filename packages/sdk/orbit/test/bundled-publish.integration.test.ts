// Integration tests for the bundled publish chain.
//
// Exercises (1) the bundler against real showcase sources from examples/,
// (2) the publish-body schemas (runtime/bundle fields), and (3) the
// interlock between bundler output and the schema's bundle struct.
//
// No live deploy. No Cloudflare. No credentials.

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Schema } from 'effect'

import { bundleOrbitSource, OrbitBundleError } from '../src/bundler'
import { OrbitAppPublishBody, OrbitAppPublishBundle } from '../src/apps'
import { OrbitJobPublishBody, OrbitJobPublishBundle } from '../src/jobs'

const SHOWCASE_DIR = resolve(import.meta.dir, '../../../../examples/company-os/orbit-ui/v2/showcase')
const FEEDBACK_APP = resolve(SHOWCASE_DIR, '03-feedback-board.app.ts')
const TRIAGE_JOB = resolve(SHOWCASE_DIR, '04-triage-report.job.ts')
const hasShowcaseSources = existsSync(FEEDBACK_APP) && existsSync(TRIAGE_JOB)
const itWithShowcaseSources = hasShowcaseSources ? it : it.skip

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

describe('bundled publish: bundler against real showcase sources', () => {
  itWithShowcaseSources('bundles the feedback-board app source (with template subpath)', async () => {
    const source = await readFile(FEEDBACK_APP, 'utf8')
    const result = await bundleOrbitSource({
      kind: 'app',
      source,
      sourcePath: FEEDBACK_APP,
      resolveDir: SHOWCASE_DIR,
      minify: true,
      metafile: true,
    })

    expect(result.runtime).toBe('bundled')
    expect(result.kind).toBe('app')
    expect(result.code.length).toBeGreaterThan(100)
    expect(result.bytes).toBeGreaterThan(0)
    expect(result.gzip_bytes).toBeGreaterThan(0)
    expect(result.gzip_bytes).toBeLessThan(1024 * 1024)
    expect(result.code).not.toMatch(/^import\s+.+from\s+["']@hrbr\/orbit\/app-ui/m)
  })

  itWithShowcaseSources('bundles the triage-report job source (job uses app-ui)', async () => {
    const source = await readFile(TRIAGE_JOB, 'utf8')
    const result = await bundleOrbitSource({
      kind: 'job',
      source,
      sourcePath: TRIAGE_JOB,
      resolveDir: SHOWCASE_DIR,
      minify: true,
    })

    expect(result.runtime).toBe('bundled')
    expect(result.kind).toBe('job')
    expect(result.code.length).toBeGreaterThan(100)
    expect(result.gzip_bytes).toBeLessThan(1024 * 1024)
    expect(result.code).not.toMatch(/^import\s+.+from\s+["']@hrbr\/orbit/m)
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
  itWithShowcaseSources('app bundler output fits OrbitAppPublishBundle', async () => {
    const source = await readFile(FEEDBACK_APP, 'utf8')
    const result = await bundleOrbitSource({
      kind: 'app',
      source,
      sourcePath: FEEDBACK_APP,
      resolveDir: SHOWCASE_DIR,
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

  itWithShowcaseSources('job bundler output fits OrbitJobPublishBundle', async () => {
    const source = await readFile(TRIAGE_JOB, 'utf8')
    const result = await bundleOrbitSource({
      kind: 'job',
      source,
      sourcePath: TRIAGE_JOB,
      resolveDir: SHOWCASE_DIR,
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
