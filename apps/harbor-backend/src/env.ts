import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { HarborSdkBackendEnv } from "./state"

export interface LoadedBackendEnv {
  readonly env: HarborSdkBackendEnv
  readonly path: string
  readonly loaded: boolean
  readonly keys: readonly string[]
}

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function parseEnvLine(line: string): readonly [string, string] | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return null
  const equals = trimmed.indexOf("=")
  if (equals <= 0) return null
  const key = trimmed.slice(0, equals).trim()
  let value = trimmed.slice(equals + 1).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  return [key, value]
}

export function parseBackendEnv(value: string | undefined): HarborSdkBackendEnv {
  if (value === "staging") return "staging"
  if (value === undefined || value === "" || value === "dev") return "dev"
  throw new Error(`Unsupported HARBOR_SDK_BACKEND_ENV "${value}". Use "dev" or "staging".`)
}

export async function loadBackendEnvFile(input?: {
  readonly env?: HarborSdkBackendEnv | undefined
  readonly overrideExisting?: boolean | undefined
}): Promise<LoadedBackendEnv> {
  const env = input?.env ?? parseBackendEnv(process.env["HARBOR_SDK_BACKEND_ENV"])
  const path = resolve(PACKAGE_DIR, `.env.${env}`)
  const file = Bun.file(path)
  if (!(await file.exists())) return { env, path, loaded: false, keys: [] }

  const keys: string[] = []
  for (const line of (await file.text()).split(/\r?\n/)) {
    const parsed = parseEnvLine(line)
    if (!parsed) continue
    const [key, value] = parsed
    if (input?.overrideExisting || process.env[key] === undefined) {
      process.env[key] = value
    }
    keys.push(key)
  }
  process.env["HARBOR_SDK_BACKEND_ENV"] = env
  return { env, path, loaded: true, keys }
}
