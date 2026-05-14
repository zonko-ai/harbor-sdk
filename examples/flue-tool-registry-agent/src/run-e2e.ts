import { runLinearToNotionE2E } from "./local-registry"

interface RunnerInput {
  readonly prompt: string
  readonly confirmNotionWrite?: boolean | undefined
  readonly projectRoot?: string | undefined
}

function readInput(): RunnerInput {
  const raw = process.env.HARBOR_FLUE_E2E_INPUT
  if (!raw) throw new Error("HARBOR_FLUE_E2E_INPUT is required.")
  return JSON.parse(raw) as RunnerInput
}

if (import.meta.main) {
  const input = readInput()
  const result = await runLinearToNotionE2E({
    prompt: input.prompt,
    projectRoot: input.projectRoot,
    confirmNotionWrite: input.confirmNotionWrite,
    env: process.env,
  })
  console.log(JSON.stringify(result))
}
