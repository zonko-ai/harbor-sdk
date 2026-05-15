import { randomUUID } from "node:crypto"
import { createRequire } from "node:module"
import {
  createOAuthAuthorizationUrl,
  createOAuthPkcePair,
  createOAuthState,
  refreshOAuthTokenSet,
  type OAuthTokenSet,
  type OAuthFetch,
} from "@hrbr/source-auth"
import {
  harborLocalPaths,
  LOCAL_WORKSPACE_ID,
} from "./index"
import { ensureHarborLocalProject } from "./index"
import {
  readHarborLocalCredentials,
  readHarborLocalCredentialKeyFromEnv,
  writeHarborLocalCredentials,
  type HarborLocalCredentialKeyEnvInput,
  type HarborLocalCredentialRecord,
} from "./credentials"

interface Statement {
  readonly run: (...args: unknown[]) => unknown
  readonly all: (...args: unknown[]) => unknown[]
}

interface SqlDatabase {
  readonly prepare: (sql: string) => Statement
  readonly close: () => void
}

type SqlDatabaseCtor = new (filename: string) => SqlDatabase

export interface HarborLocalOAuthClientInput {
  readonly sourceRefId: string
  readonly clientId: string
  readonly clientSecretRef?: string | undefined
  readonly authorizationEndpoint: string
  readonly tokenEndpoint: string
  readonly redirectUri: string
  readonly scopes?: readonly string[] | undefined
  readonly resource?: string | undefined
}

export interface HarborLocalOAuthPendingFlow {
  readonly state: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly sourceRefId: string
  readonly oauthClientId: string
  readonly codeVerifier: string
  readonly codeChallenge: string
  readonly redirectUri: string
  readonly status: "pending" | "completed" | "failed"
  readonly authorizationUrl: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalOAuthStartResult {
  readonly authorizationUrl: string
  readonly state: string
  readonly sourceRefId: string
  readonly oauthClientId: string
  readonly redirectUri: string
}

export interface HarborLocalOAuthGrant {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly sourceRefId: string
  readonly oauthClientId: string
  readonly status: "active" | "reconnect_required"
  readonly scopes: readonly string[]
  readonly expiresAt?: string | undefined
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalOAuthCompleteInput {
  readonly state: string
  readonly code: string
  readonly tokens: OAuthTokenSet
  readonly key: string
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalOAuthCallbackExchangeInput {
  readonly code: string
  readonly state: string
  readonly codeVerifier: string
  readonly redirectUri: string
  readonly sourceRefId: string
  readonly oauthClientId: string
}

export interface HarborLocalOAuthCallbackInput extends HarborLocalCredentialKeyEnvInput {
  readonly state: string
  readonly code: string
  readonly exchangeCode: (input: HarborLocalOAuthCallbackExchangeInput) => Promise<OAuthTokenSet>
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalOAuthRefreshInput extends HarborLocalCredentialKeyEnvInput {
  readonly sourceRefId: string
  readonly fetch?: OAuthFetch | undefined
  readonly force?: boolean | undefined
  readonly refreshSkewMs?: number | undefined
  readonly now?: (() => Date) | undefined
}

export type HarborLocalOAuthRefreshResult =
  | {
      readonly status: "not_needed"
      readonly grant: HarborLocalOAuthGrant
    }
  | {
      readonly status: "refreshed"
      readonly grant: HarborLocalOAuthGrant
    }
  | {
      readonly status: "requires_oauth"
    }
  | {
      readonly status: "reconnect_required"
      readonly grant?: HarborLocalOAuthGrant | undefined
      readonly error?: string | undefined
    }

export interface HarborLocalOAuthStatus {
  readonly sourceRefId: string
  readonly status: "requires_oauth" | "pending" | "ready" | "reconnect_required"
  readonly pendingFlow?: HarborLocalOAuthPendingFlow | undefined
  readonly grant?: HarborLocalOAuthGrant | undefined
}

interface OAuthClientRow {
  readonly id: string
  readonly sourceRefId: string
  readonly clientId: string
  readonly clientSecretRef?: string | undefined
  readonly tokenEndpoint: string
}

function loadDatabase(): SqlDatabaseCtor {
  const req = createRequire(import.meta.url)
  try {
    return (req("bun:sqlite") as { Database: SqlDatabaseCtor }).Database
  } catch {
    try {
      return (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
    } catch {
      throw new Error("Local OAuth store requires bun:sqlite or node:sqlite")
    }
  }
}

function openDatabase(projectRoot: string): SqlDatabase {
  const Database = loadDatabase()
  return new Database(harborLocalPaths(projectRoot).sqlite)
}

function timestamp(now: (() => Date) | undefined): string {
  return (now ?? (() => new Date()))().toISOString()
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback
  return JSON.parse(value) as T
}

function pendingFlowFromRow(row: Record<string, unknown>): HarborLocalOAuthPendingFlow {
  return {
    state: String(row["state"]),
    workspaceId: LOCAL_WORKSPACE_ID,
    sourceRefId: String(row["source_ref_id"]),
    oauthClientId: String(row["oauth_client_id"]),
    codeVerifier: String(row["code_verifier"]),
    codeChallenge: String(row["code_challenge"]),
    redirectUri: String(row["redirect_uri"]),
    status: String(row["status"]) as HarborLocalOAuthPendingFlow["status"],
    authorizationUrl: String(row["authorization_url"]),
    createdAt: String(row["created_at"]),
    updatedAt: String(row["updated_at"]),
  }
}

function grantFromRow(row: Record<string, unknown>): HarborLocalOAuthGrant {
  return {
    id: String(row["id"]),
    workspaceId: LOCAL_WORKSPACE_ID,
    sourceRefId: String(row["source_ref_id"]),
    oauthClientId: String(row["oauth_client_id"]),
    status: String(row["status"]) as HarborLocalOAuthGrant["status"],
    scopes: parseJson<readonly string[]>(row["scopes_json"], []),
    ...(row["expires_at"] !== null && row["expires_at"] !== undefined ? { expiresAt: String(row["expires_at"]) } : {}),
    createdAt: String(row["created_at"]),
    updatedAt: String(row["updated_at"]),
  }
}

function oauthClientFromRow(row: Record<string, unknown>): OAuthClientRow {
  return {
    id: String(row["id"]),
    sourceRefId: String(row["source_ref_id"]),
    clientId: String(row["client_id"]),
    ...(row["client_secret_ref"] !== null && row["client_secret_ref"] !== undefined ? { clientSecretRef: String(row["client_secret_ref"]) } : {}),
    tokenEndpoint: String(row["token_endpoint"]),
  }
}

function shouldRefreshGrant(
  grant: HarborLocalOAuthGrant,
  input: Pick<HarborLocalOAuthRefreshInput, "force" | "refreshSkewMs" | "now">
): boolean {
  if (input.force === true) return true
  if (!grant.expiresAt) return false
  const expiresAt = Date.parse(grant.expiresAt)
  if (!Number.isFinite(expiresAt)) return true
  const now = (input.now ?? (() => new Date()))().getTime()
  return expiresAt <= now + (input.refreshSkewMs ?? 300_000)
}

function credentialValue(
  credentials: readonly HarborLocalCredentialRecord[],
  sourceRefId: string,
  slot: string
): string | undefined {
  return credentials.find((record) =>
    record.sourceRefId === sourceRefId &&
    record.slot === slot &&
    record.status === "active"
  )?.value
}

function upsertCredential(
  byId: Map<string, HarborLocalCredentialRecord>,
  input: {
    readonly sourceRefId: string
    readonly slot: string
    readonly value: string
    readonly now: string
  }
): void {
  const id = `${input.sourceRefId}:${input.slot}`
  const existing = byId.get(id)
  byId.set(id, {
    id,
    workspaceId: LOCAL_WORKSPACE_ID,
    sourceRefId: input.sourceRefId,
    slot: input.slot,
    value: input.value,
    scope: "local",
    status: "active",
    createdAt: existing?.createdAt ?? input.now,
    updatedAt: input.now,
  })
}

async function markGrantReconnectRequired(
  projectRoot: string,
  sourceRefId: string,
  error?: string | undefined
): Promise<HarborLocalOAuthRefreshResult> {
  const now = new Date().toISOString()
  const db = openDatabase(projectRoot)
  try {
    db.prepare("UPDATE oauth_grants SET status = ?, updated_at = ? WHERE source_ref_id = ? AND status = ?")
      .run("reconnect_required", now, sourceRefId, "active")
  } finally {
    db.close()
  }
  const status = await readHarborLocalOAuthStatus(projectRoot, sourceRefId)
  return {
    status: "reconnect_required",
    ...(status.grant ? { grant: status.grant } : {}),
    ...(error ? { error } : {}),
  }
}

export async function startHarborLocalOAuthFlow(input: {
  readonly projectRoot: string
  readonly client: HarborLocalOAuthClientInput
  readonly now?: (() => Date) | undefined
}): Promise<HarborLocalOAuthStartResult> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const createdAt = timestamp(input.now)
  const oauthClientId = `oauth-client:${input.client.sourceRefId}`
  const state = createOAuthState()
  const pkce = createOAuthPkcePair()
  const scopes = input.client.scopes ?? []
  const authorizationUrl = createOAuthAuthorizationUrl({
    authorizationEndpoint: input.client.authorizationEndpoint,
    clientId: input.client.clientId,
    redirectUri: input.client.redirectUri,
    state,
    codeChallenge: pkce.challenge,
    scopes,
    resource: input.client.resource,
  })

  const db = openDatabase(input.projectRoot)
  try {
    db.prepare(`
      INSERT INTO oauth_clients (
        id, workspace_id, source_ref_id, client_id, client_secret_ref,
        authorization_endpoint, token_endpoint, redirect_uri, scopes_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        client_id = excluded.client_id,
        client_secret_ref = excluded.client_secret_ref,
        authorization_endpoint = excluded.authorization_endpoint,
        token_endpoint = excluded.token_endpoint,
        redirect_uri = excluded.redirect_uri,
        scopes_json = excluded.scopes_json,
        updated_at = excluded.updated_at
    `).run(
      oauthClientId,
      LOCAL_WORKSPACE_ID,
      input.client.sourceRefId,
      input.client.clientId,
      input.client.clientSecretRef ?? null,
      input.client.authorizationEndpoint,
      input.client.tokenEndpoint,
      input.client.redirectUri,
      JSON.stringify(scopes),
      createdAt,
      createdAt
    )
    db.prepare(`
      INSERT INTO oauth_pending_flows (
        state, workspace_id, source_ref_id, oauth_client_id, code_verifier,
        code_challenge, redirect_uri, status, authorization_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      state,
      LOCAL_WORKSPACE_ID,
      input.client.sourceRefId,
      oauthClientId,
      pkce.verifier,
      pkce.challenge,
      input.client.redirectUri,
      "pending",
      authorizationUrl,
      createdAt,
      createdAt
    )
  } finally {
    db.close()
  }

  return {
    authorizationUrl,
    state,
    sourceRefId: input.client.sourceRefId,
    oauthClientId,
    redirectUri: input.client.redirectUri,
  }
}

export async function readHarborLocalOAuthPendingFlow(
  projectRoot: string,
  state: string
): Promise<HarborLocalOAuthPendingFlow | null> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  try {
    const row = db.prepare("SELECT * FROM oauth_pending_flows WHERE state = ?").all(state)[0] as Record<string, unknown> | undefined
    return row ? pendingFlowFromRow(row) : null
  } finally {
    db.close()
  }
}

export async function completeHarborLocalOAuthFlow(
  projectRoot: string,
  input: HarborLocalOAuthCompleteInput
): Promise<HarborLocalOAuthGrant> {
  const pending = await readHarborLocalOAuthPendingFlow(projectRoot, input.state)
  if (!pending) throw new Error(`Unknown local OAuth state "${input.state}"`)
  if (pending.status !== "pending") throw new Error(`Local OAuth state "${input.state}" is not pending`)
  const now = timestamp(input.now)
  const grantId = `oauth-grant:${pending.sourceRefId}`
  const scopes = input.tokens.scopes ?? []

  const db = openDatabase(projectRoot)
  try {
    db.prepare(`
      INSERT INTO oauth_grants (
        id, workspace_id, source_ref_id, oauth_client_id, status, scopes_json, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        scopes_json = excluded.scopes_json,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `).run(
      grantId,
      LOCAL_WORKSPACE_ID,
      pending.sourceRefId,
      pending.oauthClientId,
      "active",
      JSON.stringify(scopes),
      input.tokens.expiresAt ?? null,
      now,
      now
    )
    db.prepare("UPDATE oauth_pending_flows SET status = ?, updated_at = ? WHERE state = ?").run("completed", now, input.state)
    for (const slot of ["access_token", ...(input.tokens.refreshToken ? ["refresh_token"] : [])]) {
      db.prepare(`
        INSERT INTO credential_metadata (
          id, workspace_id, source_ref_id, slot, scope, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at
      `).run(`${pending.sourceRefId}:${slot}`, LOCAL_WORKSPACE_ID, pending.sourceRefId, slot, "local", "active", now, now)
    }
  } finally {
    db.close()
  }

  const current = await readHarborLocalCredentials(projectRoot, input.key)
  const nextCredentials = new Map(current.credentials.map((credential) => [credential.id, credential]))
  const tokenRecords: HarborLocalCredentialRecord[] = [
    {
      id: `${pending.sourceRefId}:access_token`,
      workspaceId: LOCAL_WORKSPACE_ID,
      sourceRefId: pending.sourceRefId,
      slot: "access_token",
      value: input.tokens.accessToken,
      scope: "local",
      status: "active",
      createdAt: nextCredentials.get(`${pending.sourceRefId}:access_token`)?.createdAt ?? now,
      updatedAt: now,
    },
  ]
  if (input.tokens.refreshToken) {
    tokenRecords.push({
      id: `${pending.sourceRefId}:refresh_token`,
      workspaceId: LOCAL_WORKSPACE_ID,
      sourceRefId: pending.sourceRefId,
      slot: "refresh_token",
      value: input.tokens.refreshToken,
      scope: "local",
      status: "active",
      createdAt: nextCredentials.get(`${pending.sourceRefId}:refresh_token`)?.createdAt ?? now,
      updatedAt: now,
    })
  }
  for (const record of tokenRecords) nextCredentials.set(record.id, record)
  await writeHarborLocalCredentials(projectRoot, {
    version: 1,
    workspaceId: LOCAL_WORKSPACE_ID,
    credentials: [...nextCredentials.values()].sort((a, b) => a.id.localeCompare(b.id)),
  }, input.key)

  return {
    id: grantId,
    workspaceId: LOCAL_WORKSPACE_ID,
    sourceRefId: pending.sourceRefId,
    oauthClientId: pending.oauthClientId,
    status: "active",
    scopes,
    ...(input.tokens.expiresAt !== undefined ? { expiresAt: input.tokens.expiresAt } : {}),
    createdAt: now,
    updatedAt: now,
  }
}

export async function completeHarborLocalOAuthCallback(
  projectRoot: string,
  input: HarborLocalOAuthCallbackInput
): Promise<HarborLocalOAuthGrant> {
  const pending = await readHarborLocalOAuthPendingFlow(projectRoot, input.state)
  if (!pending) throw new Error(`Unknown local OAuth state "${input.state}"`)
  const tokens = await input.exchangeCode({
    code: input.code,
    state: input.state,
    codeVerifier: pending.codeVerifier,
    redirectUri: pending.redirectUri,
    sourceRefId: pending.sourceRefId,
    oauthClientId: pending.oauthClientId,
  })
  return completeHarborLocalOAuthFlow(projectRoot, {
    state: input.state,
    code: input.code,
    tokens,
    key: readHarborLocalCredentialKeyFromEnv(input),
    now: input.now,
  })
}

export async function refreshHarborLocalOAuthGrant(
  projectRoot: string,
  input: HarborLocalOAuthRefreshInput
): Promise<HarborLocalOAuthRefreshResult> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  let grant: HarborLocalOAuthGrant | null = null
  let client: OAuthClientRow | null = null
  try {
    const grantRow = db.prepare(`
      SELECT * FROM oauth_grants
      WHERE source_ref_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `).all(input.sourceRefId)[0] as Record<string, unknown> | undefined
    grant = grantRow ? grantFromRow(grantRow) : null
    if (!grant) return { status: "requires_oauth" }
    if (grant.status === "reconnect_required") return { status: "reconnect_required", grant }
    if (!shouldRefreshGrant(grant, input)) return { status: "not_needed", grant }

    const clientRow = db.prepare("SELECT * FROM oauth_clients WHERE id = ? LIMIT 1")
      .all(grant.oauthClientId)[0] as Record<string, unknown> | undefined
    client = clientRow ? oauthClientFromRow(clientRow) : null
  } finally {
    db.close()
  }

  if (!client) {
    return markGrantReconnectRequired(projectRoot, input.sourceRefId, "OAuth client metadata is missing.")
  }

  const key = readHarborLocalCredentialKeyFromEnv(input)
  const current = await readHarborLocalCredentials(projectRoot, key)
  const refreshToken = credentialValue(current.credentials, input.sourceRefId, "refresh_token")
  if (!refreshToken) {
    return markGrantReconnectRequired(projectRoot, input.sourceRefId, "OAuth refresh token is missing.")
  }

  const clientSecret = client.clientSecretRef
    ? credentialValue(current.credentials, input.sourceRefId, client.clientSecretRef)
    : undefined

  let tokens: OAuthTokenSet
  try {
    tokens = await refreshOAuthTokenSet({
      tokenEndpoint: client.tokenEndpoint,
      refreshToken,
      clientId: client.clientId,
      ...(clientSecret ? { clientSecret } : {}),
      fetch: input.fetch,
    })
  } catch (error) {
    return markGrantReconnectRequired(
      projectRoot,
      input.sourceRefId,
      error instanceof Error ? error.message : String(error)
    )
  }

  const now = timestamp(input.now)
  const scopes = tokens.scopes ?? grant.scopes
  const dbAfterRefresh = openDatabase(projectRoot)
  try {
    dbAfterRefresh.prepare(`
      UPDATE oauth_grants
      SET status = ?, scopes_json = ?, expires_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      "active",
      JSON.stringify(scopes),
      tokens.expiresAt ?? grant.expiresAt ?? null,
      now,
      grant.id
    )
    for (const slot of ["access_token", "refresh_token"]) {
      dbAfterRefresh.prepare(`
        INSERT INTO credential_metadata (
          id, workspace_id, source_ref_id, slot, scope, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at
      `).run(`${input.sourceRefId}:${slot}`, LOCAL_WORKSPACE_ID, input.sourceRefId, slot, "local", "active", now, now)
    }
  } finally {
    dbAfterRefresh.close()
  }

  const byId = new Map(current.credentials.map((credential) => [credential.id, credential]))
  upsertCredential(byId, {
    sourceRefId: input.sourceRefId,
    slot: "access_token",
    value: tokens.accessToken,
    now,
  })
  upsertCredential(byId, {
    sourceRefId: input.sourceRefId,
    slot: "refresh_token",
    value: tokens.refreshToken ?? refreshToken,
    now,
  })
  await writeHarborLocalCredentials(projectRoot, {
    version: 1,
    workspaceId: LOCAL_WORKSPACE_ID,
    credentials: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
  }, key)

  return {
    status: "refreshed",
    grant: {
      ...grant,
      status: "active",
      scopes,
      ...(tokens.expiresAt ?? grant.expiresAt ? { expiresAt: tokens.expiresAt ?? grant.expiresAt } : {}),
      updatedAt: now,
    },
  }
}

export async function readHarborLocalOAuthStatus(
  projectRoot: string,
  sourceRefId: string
): Promise<HarborLocalOAuthStatus> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  try {
    const grantRow = db.prepare(`
      SELECT * FROM oauth_grants
      WHERE source_ref_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `).all(sourceRefId)[0] as Record<string, unknown> | undefined
    const grant = grantRow ? grantFromRow(grantRow) : null
    if (grant?.status === "active") return { sourceRefId, status: "ready", grant }
    if (grant?.status === "reconnect_required") return { sourceRefId, status: "reconnect_required", grant }

    const pendingRow = db.prepare(`
      SELECT * FROM oauth_pending_flows
      WHERE source_ref_id = ? AND status = 'pending'
      ORDER BY updated_at DESC
      LIMIT 1
    `).all(sourceRefId)[0] as Record<string, unknown> | undefined
    const pendingFlow = pendingRow ? pendingFlowFromRow(pendingRow) : null
    if (pendingFlow) return { sourceRefId, status: "pending", pendingFlow }
    return { sourceRefId, status: "requires_oauth" }
  } finally {
    db.close()
  }
}
