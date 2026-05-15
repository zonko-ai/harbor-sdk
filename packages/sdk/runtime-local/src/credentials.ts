import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { harborLocalPaths, LOCAL_WORKSPACE_ID } from "./index"
import { HarborLocalError } from "./errors"

export const HARBOR_LOCAL_CREDENTIAL_KEY_ENV = "HARBOR_LOCAL_CREDENTIAL_KEY"

export interface HarborLocalCredentialRecord {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly sourceRefId?: string | undefined
  readonly slot: string
  readonly value: string
  readonly scope: "local" | "workspace"
  readonly status: "active" | "disabled"
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalCredentialsFile {
  readonly version: 1
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly credentials: readonly HarborLocalCredentialRecord[]
}

export interface HarborLocalEncryptedCredentialsFile {
  readonly version: 1
  readonly algorithm: "aes-256-gcm"
  readonly salt: string
  readonly iv: string
  readonly tag: string
  readonly ciphertext: string
}

export interface HarborLocalCredentialEnvImportInput {
  readonly sourceRefId?: string | undefined
  readonly slots: Readonly<Record<string, string>>
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly key: string
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalCredentialKeyEnvInput {
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly envName?: string | undefined
}

export type HarborLocalCredentialEnvImportFromKeyInput =
  Omit<HarborLocalCredentialEnvImportInput, "key"> & HarborLocalCredentialKeyEnvInput

function deriveKey(key: string, salt: Buffer): Buffer {
  return scryptSync(key, salt, 32)
}

function encryptJson(value: unknown, key: string): HarborLocalEncryptedCredentialsFile {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", deriveKey(key, salt), iv)
  const plaintext = JSON.stringify(value)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    salt: salt.toString("base64url"),
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  }
}

function decryptJson(file: HarborLocalEncryptedCredentialsFile, key: string): unknown {
  const salt = Buffer.from(file.salt, "base64url")
  const iv = Buffer.from(file.iv, "base64url")
  const tag = Buffer.from(file.tag, "base64url")
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(key, salt), iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(file.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8")
  return JSON.parse(plaintext) as unknown
}

export function redactHarborSecret(value: string): string {
  if (value.length <= 8) return "********"
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export function readHarborLocalCredentialKeyFromEnv(
  input: HarborLocalCredentialKeyEnvInput = {}
): string {
  const envName = input.envName ?? HARBOR_LOCAL_CREDENTIAL_KEY_ENV
  const env = input.env ?? process.env
  const key = env[envName]?.trim()
  if (!key) {
    throw new HarborLocalError({
      code: "local_credentials_key_required",
      message: `${envName} is required to read or write local Harbor credentials.`,
      details: { envName },
    })
  }
  return key
}

export async function writeHarborLocalCredentials(
  projectRoot: string,
  file: HarborLocalCredentialsFile,
  key: string
): Promise<void> {
  const paths = harborLocalPaths(projectRoot)
  const encrypted = encryptJson(file, key)
  await writeFile(paths.credentials, `${JSON.stringify(encrypted, null, 2)}\n`)
}

export async function readHarborLocalCredentials(
  projectRoot: string,
  key: string
): Promise<HarborLocalCredentialsFile> {
  const paths = harborLocalPaths(projectRoot)
  try {
    const encrypted = JSON.parse(await readFile(paths.credentials, "utf8")) as HarborLocalEncryptedCredentialsFile
    return decryptJson(encrypted, key) as HarborLocalCredentialsFile
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: 1, workspaceId: LOCAL_WORKSPACE_ID, credentials: [] }
    }
    throw error
  }
}

export async function readHarborLocalCredentialsFromEnvKey(
  projectRoot: string,
  input: HarborLocalCredentialKeyEnvInput = {}
): Promise<HarborLocalCredentialsFile> {
  return readHarborLocalCredentials(projectRoot, readHarborLocalCredentialKeyFromEnv(input))
}

export async function importHarborLocalCredentialsFromEnv(
  projectRoot: string,
  input: HarborLocalCredentialEnvImportInput
): Promise<HarborLocalCredentialsFile> {
  const now = input.now ?? (() => new Date())
  const env = input.env ?? process.env
  const current = await readHarborLocalCredentials(projectRoot, input.key)
  const timestamp = now().toISOString()
  const byId = new Map(current.credentials.map((record) => [record.id, record]))

  for (const [slot, envName] of Object.entries(input.slots)) {
    const value = env[envName]
    if (!value) continue
    const id = input.sourceRefId ? `${input.sourceRefId}:${slot}` : `local:${slot}`
    const existing = byId.get(id)
    byId.set(id, {
      id,
      workspaceId: LOCAL_WORKSPACE_ID,
      ...(input.sourceRefId !== undefined ? { sourceRefId: input.sourceRefId } : {}),
      slot,
      value,
      scope: "local",
      status: "active",
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    })
  }

  const next: HarborLocalCredentialsFile = {
    version: 1 as const,
    workspaceId: LOCAL_WORKSPACE_ID,
    credentials: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
  }
  await writeHarborLocalCredentials(projectRoot, next, input.key)
  return next
}

export async function importHarborLocalCredentialsFromEnvKey(
  projectRoot: string,
  input: HarborLocalCredentialEnvImportFromKeyInput
): Promise<HarborLocalCredentialsFile> {
  const key = readHarborLocalCredentialKeyFromEnv(input)
  return importHarborLocalCredentialsFromEnv(projectRoot, { ...input, key })
}

export async function removeHarborLocalCredentialsForSource(
  projectRoot: string,
  input: {
    readonly sourceRefId: string
    readonly key: string
  }
): Promise<HarborLocalCredentialsFile> {
  const current = await readHarborLocalCredentials(projectRoot, input.key)
  const next: HarborLocalCredentialsFile = {
    version: 1,
    workspaceId: LOCAL_WORKSPACE_ID,
    credentials: current.credentials
      .filter((credential) => credential.sourceRefId !== input.sourceRefId)
      .sort((a, b) => a.id.localeCompare(b.id)),
  }
  await writeHarborLocalCredentials(projectRoot, next, input.key)
  return next
}
