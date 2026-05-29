import { createHarborClient } from '@hrbr/client'

const tokenProvider = async () => 'example-access-token'

export const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  auth: { kind: 'bearer', tokenProvider },
  fetch: async (input, init) =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          url: String(input),
          authorization: new Headers(init?.headers).get('authorization'),
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    ),
})

export const loadVisibleWorkspaces = async () => harbor.api.listWorkspaces({ limit: 25 })

if (import.meta.main) {
  const workspaces = await loadVisibleWorkspaces()
  console.log(JSON.stringify(workspaces, null, 2))
}
