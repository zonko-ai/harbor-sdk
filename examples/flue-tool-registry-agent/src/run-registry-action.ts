import {
  runHarborLocalRegistryAction,
  type HarborLocalRegistryAction,
} from "@hrbr/runtime-local"

interface RunnerInput {
  readonly action: HarborLocalRegistryAction
  readonly confirmWrites?: boolean | undefined
  readonly projectRoot?: string | undefined
}

function readInput(): RunnerInput {
  const raw = process.env.HARBOR_REGISTRY_ACTION_INPUT
  if (!raw) throw new Error("HARBOR_REGISTRY_ACTION_INPUT is required.")
  return JSON.parse(raw) as RunnerInput
}

if (import.meta.main) {
  const input = readInput()
  const result = await runHarborLocalRegistryAction({
    action: input.action,
    projectRoot: input.projectRoot ?? process.cwd(),
    confirmWrites: input.confirmWrites,
    env: process.env,
    writeBlockedReason: "Write tool blocked. Set HARBOR_CONFIRM_NOTION_WRITE=1 to allow Notion write invocations.",
  })
  console.log(JSON.stringify(result))
}
