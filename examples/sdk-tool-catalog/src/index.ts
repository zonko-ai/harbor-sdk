import { createHarborClient } from "@hrbr/client"

const apiUrl = process.env.HRBR_API_URL
if (!apiUrl) throw new Error("HRBR_API_URL is required")

const apiKey = process.env.HRBR_API_KEY
if (!apiKey) throw new Error("HRBR_API_KEY is required")

const workspaceId = process.env.HRBR_WORKSPACE_ID
if (!workspaceId) throw new Error("HRBR_WORKSPACE_ID is required")

const harbor = createHarborClient({
  apiUrl,
  apiKey,
  workspaceId,
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
