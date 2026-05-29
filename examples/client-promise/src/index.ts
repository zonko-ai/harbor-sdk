import { createHarborClient } from '@hrbr/client'

const exampleSkillContent = '---\nname: harbor-example\n---\n# Harbor Example\n'

const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: 'workspace_example',
  auth: { kind: 'api_key', key: 'hrbr_example_key' },
  fetch: async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          mode: 'exec',
          run_id: 'run_example',
          result: 'Loaded harbor-example skill',
          content: [
            { type: 'text', text: 'Loaded harbor-example skill' },
            {
              type: 'skill_bundle',
              skill: {
                slug: 'harbor-example',
                content: exampleSkillContent,
                content_hash: 'example-hash',
                files: [],
              },
            },
          ],
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    ),
})

export const executeExample = async () =>
  harbor.runtime.execute({
    code: 'return "Loaded harbor-example skill"',
  })

if (import.meta.main) {
  const result = await executeExample()
  console.log(result.content?.[0])
  console.log(result.content?.[1])
}
