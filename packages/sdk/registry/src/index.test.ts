// @ts-nocheck
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getLocalIcon, isLocalIconUrl } from './index'

describe('@hrbr/registry local icon helpers', () => {
  it('recognizes canonical Harbor plugin icon paths', () => {
    assert.equal(isLocalIconUrl('/plugin-icons/github-mcp.svg'), true)
    assert.equal(isLocalIconUrl('https://tryharbor.ai/plugin-icons/github-mcp.svg'), true)
    assert.equal(isLocalIconUrl('https://stag.tryharbor.ai/plugin-icons/github-mcp.svg'), true)
    assert.equal(isLocalIconUrl('https://example.com/favicon.ico'), false)
    assert.equal(isLocalIconUrl(undefined), false)
  })

  it('maps shipped cli slugs onto local canonical assets where available', () => {
    assert.deepEqual(getLocalIcon('gh-cli'), {
      kind: 'single',
      path: '/plugin-icons/github-mcp.svg',
      style: 'mono',
    })
    assert.deepEqual(getLocalIcon('vercel-cli'), {
      kind: 'single',
      path: '/plugin-icons/vercel-mcp.svg',
      style: 'mono',
    })
  })
})
