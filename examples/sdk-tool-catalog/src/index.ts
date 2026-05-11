import { createHarborClient } from "@hrbr/client"

const harbor = createHarborClient({
  apiUrl: process.env.HRBR_API_URL ?? "https://api.tryharbor.ai",
  apiKey: process.env.HRBR_API_KEY ?? "replace-me",
  workspaceId: process.env.HRBR_WORKSPACE_ID ?? "11111111-1111-4111-8111-111111111111",
})

const matches = await harbor.tools.search({
  query: "send email",
  limit: 5,
})

const first = matches.hits[0]
if (first) {
  const schema = await harbor.tools.schema({ toolId: `${first.namespace}.${first.tool_id}` })
  console.log({
    match: first.signature,
    inputType: schema.input_type,
  })
} else {
  console.log({ match: null })
}
