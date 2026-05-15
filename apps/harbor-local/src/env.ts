import { resolve } from "node:path"

export const HARBOR_LOCAL_DEFAULT_PORT = 7332
export const HARBOR_LOCAL_DEFAULT_HOST = "127.0.0.1"

export interface HarborLocalServerEnv {
  readonly projectRoot: string
  readonly host: string
  readonly port: number
  readonly credentialKey?: string | undefined
  readonly oauthPort?: number | undefined
}

function parsePort(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim().length === 0) return fallback
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`${name} must be an integer port between 1 and 65535.`)
  }
  return port
}

function optionalPort(value: string | undefined, name: string): number | undefined {
  if (value === undefined || value.trim().length === 0) return undefined
  return parsePort(value, HARBOR_LOCAL_DEFAULT_PORT, name)
}

export function readHarborLocalServerEnv(
  env: Readonly<Record<string, string | undefined>> = process.env
): HarborLocalServerEnv {
  return {
    projectRoot: resolve(env["HARBOR_LOCAL_PROJECT_DIR"] ?? process.cwd()),
    host: env["HARBOR_LOCAL_HOST"] ?? HARBOR_LOCAL_DEFAULT_HOST,
    port: parsePort(env["HARBOR_LOCAL_PORT"], HARBOR_LOCAL_DEFAULT_PORT, "HARBOR_LOCAL_PORT"),
    credentialKey: env["HARBOR_LOCAL_CREDENTIAL_KEY"],
    oauthPort: optionalPort(env["HARBOR_LOCAL_OAUTH_PORT"], "HARBOR_LOCAL_OAUTH_PORT"),
  }
}
