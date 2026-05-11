// @hrbr/source-credentials — credential slots and effective binding logic.
//
// PRUNE pass kept the slot-kind/scope schemas + effective-binding helpers as
// internals. CredentialSlot and CredentialBinding remain exported because
// @hrbr/source-policy and @hrbr/source-auth import them as the canonical
// shape; the helpers are not yet wired to a runtime consumer.
import { Schema } from 'effect'
import { SourceId, WorkspaceId } from '@hrbr/source-core'

const CredentialSlotKind = Schema.Literals([
  'oauth_token',
  'api_key',
  'client_id',
  'client_secret',
  'managed_account',
  'webhook_secret',
  'env_secret',
])
type CredentialSlotKind = typeof CredentialSlotKind.Type

const CredentialSlotScope = Schema.Literals(['workspace', 'caller', 'source', 'machine'])
type CredentialSlotScope = typeof CredentialSlotScope.Type

export const CredentialSlot = Schema.Struct({
  slot: Schema.NonEmptyString,
  kind: CredentialSlotKind,
  label: Schema.NonEmptyString,
  optional: Schema.optional(Schema.Boolean),
  scope: Schema.optional(CredentialSlotScope),
})
export type CredentialSlot = typeof CredentialSlot.Type

const CredentialBindingValue = Schema.Union([
  Schema.Struct({ kind: Schema.Literal('secret'), secret_id: Schema.NonEmptyString }),
  Schema.Struct({ kind: Schema.Literal('connection'), connection_id: Schema.NonEmptyString }),
  Schema.Struct({ kind: Schema.Literal('managed_account'), account_id: Schema.NonEmptyString }),
  Schema.Struct({
    kind: Schema.Literal('env'),
    env: Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/)),
  }),
])
type CredentialBindingValue = typeof CredentialBindingValue.Type
export type { CredentialBindingValue }

export const CredentialBinding = Schema.Struct({
  workspace_id: WorkspaceId,
  source_id: SourceId,
  slot: Schema.NonEmptyString,
  scope: CredentialSlotScope,
  principal_id: Schema.optional(Schema.NonEmptyString),
  value: CredentialBindingValue,
  status: Schema.Literals(['active', 'missing', 'invalid', 'reconnect_required']),
})
export type CredentialBinding = typeof CredentialBinding.Type

export interface SecretRef {
  readonly kind: 'secret_ref'
  readonly id: string
}

export interface ResolvedCredentials {
  readonly get: (slot: string) => string | undefined
  readonly require: (slot: string) => string
  readonly has: (slot: string) => boolean
  readonly slots: () => readonly string[]
}

export interface CredentialResolveInput {
  readonly workspaceId: string
  readonly sourceId: string
  readonly principalId?: string | undefined
  readonly slots?: readonly string[] | undefined
}

export interface CredentialStore {
  readonly readSecret: (ref: SecretRef) => Promise<string | undefined>
}

export interface CredentialResolver {
  readonly resolve: (input: CredentialResolveInput) => Promise<ResolvedCredentials>
}

export interface CreateCredentialResolverInput {
  readonly store: CredentialStore
  readonly bindings: readonly CredentialBinding[]
}

export interface CreateMemoryCredentialStoreInput {
  readonly secrets?: Readonly<Record<string, string>> | undefined
}

export class MissingCredentialError extends Error {
  readonly slot: string

  constructor(slot: string) {
    super(`Missing credential for slot "${slot}"`)
    this.name = 'MissingCredentialError'
    this.slot = slot
  }
}

function secretRef(id: string): SecretRef {
  return { kind: 'secret_ref', id }
}

function bindingMatches(input: CredentialResolveInput, binding: CredentialBinding): boolean {
  if (binding.workspace_id !== input.workspaceId) return false
  if (binding.source_id !== input.sourceId) return false
  if (binding.status !== 'active') return false
  if (input.slots && !input.slots.includes(binding.slot)) return false
  if (binding.scope === 'caller') return binding.principal_id === input.principalId
  return true
}

function credentialRef(binding: CredentialBinding): SecretRef | null {
  switch (binding.value.kind) {
    case 'secret':
      return secretRef(binding.value.secret_id)
    case 'connection':
      return secretRef(binding.value.connection_id)
    case 'managed_account':
      return secretRef(binding.value.account_id)
    case 'env':
      return secretRef(binding.value.env)
  }
}

function resolvedCredentials(values: ReadonlyMap<string, string>): ResolvedCredentials {
  return {
    get: (slot) => values.get(slot),
    require: (slot) => {
      const value = values.get(slot)
      if (value === undefined) throw new MissingCredentialError(slot)
      return value
    },
    has: (slot) => values.has(slot),
    slots: () => [...values.keys()],
  }
}

export function createMemoryCredentialStore(input: CreateMemoryCredentialStoreInput = {}): CredentialStore {
  const secrets = new Map(Object.entries(input.secrets ?? {}))
  return {
    readSecret: async (ref) => secrets.get(ref.id),
  }
}

export function createCredentialResolver(input: CreateCredentialResolverInput): CredentialResolver {
  return {
    resolve: async (resolveInput) => {
      const values = new Map<string, string>()
      for (const binding of input.bindings) {
        if (!bindingMatches(resolveInput, binding)) continue
        const ref = credentialRef(binding)
        if (!ref) continue
        const value = await input.store.readSecret(ref)
        if (value !== undefined) values.set(binding.slot, value)
      }
      return resolvedCredentials(values)
    },
  }
}
