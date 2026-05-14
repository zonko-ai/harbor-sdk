import { runRegistryAction, type RegistryAction } from "./local-registry"

interface RunnerInput {
  readonly action: RegistryAction
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
  const result = await runRegistryAction({
    action: input.action,
    projectRoot: input.projectRoot,
    confirmWrites: input.confirmWrites,
    env: process.env,
  })
  console.log(JSON.stringify(result))
}
