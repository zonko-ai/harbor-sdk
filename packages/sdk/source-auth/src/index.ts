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

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64url')
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
