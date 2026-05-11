// @hrbr/source-auth — auth and install contracts selected by SourcePolicy.
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
