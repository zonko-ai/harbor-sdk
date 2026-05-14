// @hrbr/source-auth — auth and install contracts selected by SourcePolicy.
import { createHash, randomBytes } from 'node:crypto'
import { Schema } from 'effect'

export const AuthKind = Schema.Literals([
  'none',
  'static_secret',
  'native_oauth',
  'global_confidential_oauth',
  'manual_client_oauth',
  'managed_account',
])
export type AuthKind = typeof AuthKind.Type

export const InstallFlow = Schema.Literals([
  'direct',
  'discover',
  'discover_then_auth',
  'manual_credentials',
  'managed_provider',
  'queued_import',
])
export type InstallFlow = typeof InstallFlow.Type

export interface OAuthPkcePair {
  readonly verifier: string
  readonly challenge: string
  readonly method: 'S256'
}

export interface OAuthAuthorizationUrlInput {
  readonly authorizationEndpoint: string
  readonly clientId: string
  readonly redirectUri: string
  readonly state: string
  readonly codeChallenge: string
  readonly scopes?: readonly string[] | undefined
  readonly resource?: string | undefined
  readonly audience?: string | undefined
  readonly extraParams?: Readonly<Record<string, string | undefined>> | undefined
}

export interface OAuthTokenSet {
  readonly accessToken: string
  readonly refreshToken?: string | undefined
  readonly tokenType?: string | undefined
  readonly expiresAt?: string | undefined
  readonly scopes?: readonly string[] | undefined
}

export type OAuthFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>

export interface OAuthDynamicClientRegistrationInput {
  readonly registrationEndpoint: string
  readonly clientName: string
  readonly redirectUris: readonly string[]
  readonly clientUri?: string | undefined
  readonly scopes?: readonly string[] | undefined
  readonly tokenEndpointAuthMethod?: 'none' | 'client_secret_post' | 'client_secret_basic' | undefined
  readonly fetch?: OAuthFetch | undefined
}

export interface OAuthRegisteredClient {
  readonly clientId: string
  readonly clientSecret?: string | undefined
  readonly clientIdIssuedAt?: number | undefined
  readonly clientSecretExpiresAt?: number | undefined
  readonly raw: unknown
}

export interface OAuthAuthorizationCodeExchangeInput {
  readonly tokenEndpoint: string
  readonly code: string
  readonly codeVerifier: string
  readonly clientId: string
  readonly redirectUri: string
  readonly clientSecret?: string | undefined
  readonly fetch?: OAuthFetch | undefined
}

export interface OAuthRefreshTokenInput {
  readonly tokenEndpoint: string
  readonly refreshToken: string
  readonly clientId: string
  readonly clientSecret?: string | undefined
  readonly fetch?: OAuthFetch | undefined
}

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64url')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function numberField(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

async function readJsonResponse(response: Response, operation: string): Promise<unknown> {
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${operation} failed with status ${response.status}${text ? `: ${text}` : ''}`)
  }
  return text.trim().length === 0 ? {} : JSON.parse(text) as unknown
}

function tokenSetFromResponse(raw: unknown): OAuthTokenSet {
  if (!isRecord(raw)) throw new Error('OAuth token response was not an object.')
  const accessToken = stringField(raw, 'access_token')
  if (!accessToken) throw new Error('OAuth token response did not include access_token.')
  const expiresIn = numberField(raw, 'expires_in')
  const scope = stringField(raw, 'scope')
  return {
    accessToken,
    ...(stringField(raw, 'refresh_token') !== undefined ? { refreshToken: stringField(raw, 'refresh_token') } : {}),
    ...(stringField(raw, 'token_type') !== undefined ? { tokenType: stringField(raw, 'token_type') } : {}),
    ...(expiresIn !== undefined ? { expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() } : {}),
    ...(scope !== undefined ? { scopes: scope.split(/\s+/g).filter(Boolean) } : {}),
  }
}

export function createOAuthState(): string {
  return base64Url(randomBytes(24))
}

export function createOAuthPkcePair(verifier = base64Url(randomBytes(32))): OAuthPkcePair {
  return {
    verifier,
    challenge: base64Url(createHash('sha256').update(verifier).digest()),
    method: 'S256',
  }
}

export function createOAuthAuthorizationUrl(input: OAuthAuthorizationUrlInput): string {
  const url = new URL(input.authorizationEndpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', input.clientId)
  url.searchParams.set('redirect_uri', input.redirectUri)
  url.searchParams.set('state', input.state)
  url.searchParams.set('code_challenge', input.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  if (input.scopes && input.scopes.length > 0) url.searchParams.set('scope', input.scopes.join(' '))
  if (input.resource) url.searchParams.set('resource', input.resource)
  if (input.audience) url.searchParams.set('audience', input.audience)
  for (const [key, value] of Object.entries(input.extraParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value)
  }
  return url.toString()
}

export async function registerOAuthDynamicClient(
  input: OAuthDynamicClientRegistrationInput
): Promise<OAuthRegisteredClient> {
  const fetchImpl = input.fetch ?? globalThis.fetch
  const body = {
    client_name: input.clientName,
    ...(input.clientUri !== undefined ? { client_uri: input.clientUri } : {}),
    redirect_uris: input.redirectUris,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: input.tokenEndpointAuthMethod ?? 'none',
    ...(input.scopes && input.scopes.length > 0 ? { scope: input.scopes.join(' ') } : {}),
  }
  const raw = await readJsonResponse(await fetchImpl(input.registrationEndpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }), 'OAuth dynamic client registration')
  if (!isRecord(raw)) throw new Error('OAuth client registration response was not an object.')
  const clientId = stringField(raw, 'client_id')
  if (!clientId) throw new Error('OAuth client registration response did not include client_id.')
  return {
    clientId,
    ...(stringField(raw, 'client_secret') !== undefined ? { clientSecret: stringField(raw, 'client_secret') } : {}),
    ...(numberField(raw, 'client_id_issued_at') !== undefined ? { clientIdIssuedAt: numberField(raw, 'client_id_issued_at') } : {}),
    ...(numberField(raw, 'client_secret_expires_at') !== undefined ? { clientSecretExpiresAt: numberField(raw, 'client_secret_expires_at') } : {}),
    raw,
  }
}

export async function exchangeOAuthAuthorizationCode(
  input: OAuthAuthorizationCodeExchangeInput
): Promise<OAuthTokenSet> {
  const fetchImpl = input.fetch ?? globalThis.fetch
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    code_verifier: input.codeVerifier,
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
  })
  if (input.clientSecret) params.set('client_secret', input.clientSecret)
  return tokenSetFromResponse(await readJsonResponse(await fetchImpl(input.tokenEndpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  }), 'OAuth authorization code exchange'))
}

export async function refreshOAuthTokenSet(input: OAuthRefreshTokenInput): Promise<OAuthTokenSet> {
  const fetchImpl = input.fetch ?? globalThis.fetch
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: input.refreshToken,
    client_id: input.clientId,
  })
  if (input.clientSecret) params.set('client_secret', input.clientSecret)
  return tokenSetFromResponse(await readJsonResponse(await fetchImpl(input.tokenEndpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  }), 'OAuth refresh token exchange'))
}
