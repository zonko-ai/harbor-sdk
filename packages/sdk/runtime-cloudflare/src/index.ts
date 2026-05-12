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

export interface CloudflareProvisioningClient {
  readonly createResource?: (resource: CloudflareOrbitResourceRef) => Promise<CloudflareOrbitResourceRef> | CloudflareOrbitResourceRef
  readonly deleteResource?: (resource: CloudflareOrbitResourceRef) => Promise<void> | void
}

export interface ApplyCloudflareProvisioningPlanInput {
  readonly plan: CloudflareProvisioningPlan
  readonly confirmed: boolean
  readonly client?: CloudflareProvisioningClient | undefined
  readonly now?: (() => Date) | undefined
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

function resourceKey(resource: CloudflareOrbitResourceRef): string {
  return `${resource.kind}:${resource.name}`
}

export function createCloudflareProvisioningPlan(input: {
  readonly account: CloudflareAccountRef
  readonly desiredResources: readonly CloudflareOrbitResourceRef[]
  readonly currentLock?: CloudflareProvisioningLock | null | undefined
}): CloudflareProvisioningPlan {
  const current = new Map((input.currentLock?.resources ?? []).map((resource) => [resourceKey(resource), resource]))
  const desired = new Map(input.desiredResources.map((resource) => [resourceKey(resource), resource]))
  const items: CloudflareProvisioningPlanItem[] = []

  for (const resource of input.desiredResources) {
    const existing = current.get(resourceKey(resource))
    items.push({
      action: existing ? "noop" : "create",
      resource: existing ?? resource,
      reason: existing ? "Resource is already present in the Cloudflare lock" : "Resource is required by the desired Orbit runtime",
      destructive: false,
    })
  }
  for (const resource of current.values()) {
    if (!desired.has(resourceKey(resource))) {
      items.push({
        action: "delete",
        resource,
        reason: "Resource exists in the lock but is no longer desired",
        destructive: true,
      })
    }
  }

  return {
    account: input.account,
    items,
    requiresConfirmation: items.some((item) => item.action !== "noop"),
  }
}

export async function applyCloudflareProvisioningPlan(
  input: ApplyCloudflareProvisioningPlanInput
): Promise<CloudflareProvisioningLock> {
  if (input.plan.requiresConfirmation && !input.confirmed) {
    throw new Error("Cloudflare provisioning requires confirmation")
  }
  const resources: CloudflareOrbitResourceRef[] = []
  for (const item of input.plan.items) {
    if (item.action === "delete") {
      await input.client?.deleteResource?.(item.resource)
      continue
    }
    if (item.action === "create") {
      resources.push(await input.client?.createResource?.(item.resource) ?? item.resource)
      continue
    }
    if (item.action === "noop") resources.push(item.resource)
  }
  return {
    account: input.plan.account,
    resources,
    updatedAt: (input.now ?? (() => new Date()))().toISOString(),
  }
}

export function cloudflareProvisioningStatus(
  lock: CloudflareProvisioningLock | null
): CloudflareProvisioningLock | null {
  return lock
}

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
