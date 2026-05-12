export type CloudflareOrbitResourceKind =
  | "r2_bucket"
  | "kv_namespace"
  | "d1_database"
  | "worker"
  | "queue"
  | "ai_gateway"
  | "durable_object_namespace"
  | "vectorize_index"

export type CloudflareProvisioningAction = "create" | "update" | "delete" | "noop"

export interface CloudflareAccountRef {
  readonly accountId: string
  readonly accountName?: string | undefined
}

export interface CloudflareOrbitResourceRef {
  readonly kind: CloudflareOrbitResourceKind
  readonly name: string
  readonly id?: string | undefined
}

export interface CloudflareProvisioningPlanItem {
  readonly action: CloudflareProvisioningAction
  readonly resource: CloudflareOrbitResourceRef
  readonly reason: string
  readonly destructive: boolean
}

export interface CloudflareProvisioningPlan {
  readonly account: CloudflareAccountRef
  readonly items: readonly CloudflareProvisioningPlanItem[]
  readonly requiresConfirmation: boolean
}

export interface CloudflareProvisioningLock {
  readonly account: CloudflareAccountRef
  readonly resources: readonly CloudflareOrbitResourceRef[]
  readonly updatedAt: string
}

export interface CloudflareRuntimeAdapter {
  readonly plan: () => Promise<CloudflareProvisioningPlan>
  readonly apply: (input: { readonly confirmed: boolean }) => Promise<CloudflareProvisioningLock>
  readonly status: () => Promise<CloudflareProvisioningLock | null>
}

export interface CloudflareRuntimeDaemonConnection {
  readonly origin: string
  readonly headers: Readonly<Record<string, string>>
}

export interface CloudflareRuntimeAdapterInput {
  readonly account: CloudflareAccountRef
  readonly connection: CloudflareRuntimeDaemonConnection
  readonly desiredResources: readonly CloudflareOrbitResourceRef[]
  readonly fetch?: typeof fetch | undefined
}

export interface CloudflareCredentialEnvImportConfig {
  readonly sourceRefId: string
  readonly slots: Readonly<Record<"api_token" | "account_id", string>>
}

export const CLOUDFLARE_CREDENTIAL_ENV = {
  apiToken: "CLOUDFLARE_API_TOKEN",
  accountId: "CLOUDFLARE_ACCOUNT_ID",
} as const

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Cloudflare runtime daemon request failed: ${response.status}`)
  }
  return await response.json() as T
}

export function cloudflareCredentialEnvImportConfig(
  sourceRefId = "cloudflare"
): CloudflareCredentialEnvImportConfig {
  return {
    sourceRefId,
    slots: {
      api_token: CLOUDFLARE_CREDENTIAL_ENV.apiToken,
      account_id: CLOUDFLARE_CREDENTIAL_ENV.accountId,
    },
  }
}

export function createCloudflareRuntimeAdapter(
  input: CloudflareRuntimeAdapterInput
): CloudflareRuntimeAdapter {
  const request = input.fetch ?? fetch
  const endpoint = (path: string) => `${input.connection.origin.replace(/\/$/, "")}${path}`
  const body = {
    account: input.account,
    desiredResources: input.desiredResources,
  }
  return {
    plan: async () => await readJson<CloudflareProvisioningPlan>(await request(endpoint("/control/cloudflare/plan"), {
      method: "POST",
      headers: {
        ...input.connection.headers,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    })),
    apply: async ({ confirmed }) => {
      if (!confirmed) throw new Error("Cloudflare runtime apply requires confirmation")
      return await readJson<CloudflareProvisioningLock>(await request(endpoint("/control/cloudflare/apply"), {
        method: "POST",
        headers: {
          ...input.connection.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({ ...body, confirmed }),
      }))
    },
    status: async () => await readJson<CloudflareProvisioningLock | null>(await request(endpoint("/control/cloudflare/status"), {
      method: "GET",
      headers: input.connection.headers,
    })),
  }
}
