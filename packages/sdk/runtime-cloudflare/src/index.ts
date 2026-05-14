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

export interface CloudflareOrbitBindingClient {
  readonly r2?: {
    readonly get: (bucket: string, key: string) => Promise<unknown> | unknown
    readonly put: (bucket: string, key: string, value: unknown) => Promise<unknown> | unknown
    readonly delete?: (bucket: string, key: string) => Promise<unknown> | unknown
  } | undefined
  readonly kv?: {
    readonly get: (namespace: string, key: string) => Promise<unknown> | unknown
    readonly put: (namespace: string, key: string, value: unknown) => Promise<unknown> | unknown
  } | undefined
  readonly d1?: {
    readonly query: (database: string, statement: string, params?: readonly unknown[]) => Promise<unknown> | unknown
  } | undefined
  readonly worker?: {
    readonly fetch: (worker: string, path: string, init?: RequestInit) => Promise<unknown> | unknown
  } | undefined
  readonly ai?: {
    readonly run: (gateway: string, model: string, input: unknown) => Promise<unknown> | unknown
  } | undefined
}

export interface CloudflareOrbitAdapterInput {
  readonly resources: readonly CloudflareOrbitResourceRef[]
  readonly client: CloudflareOrbitBindingClient
}

function requireResource(
  resources: readonly CloudflareOrbitResourceRef[],
  kind: CloudflareOrbitResourceKind
): CloudflareOrbitResourceRef {
  const resource = resources.find((item) => item.kind === kind)
  if (!resource) throw new Error(`Cloudflare Orbit resource is not configured: ${kind}`)
  return resource
}

export function createCloudflareOrbitAdapters(input: CloudflareOrbitAdapterInput) {
  const r2 = () => requireResource(input.resources, "r2_bucket")
  const kv = () => requireResource(input.resources, "kv_namespace")
  const d1 = () => requireResource(input.resources, "d1_database")
  const worker = () => requireResource(input.resources, "worker")
  const aiGateway = () => requireResource(input.resources, "ai_gateway")
  return {
    storage: {
      get: async (key: string) => await input.client.r2?.get(r2().name, key),
      put: async (key: string, value: unknown) => await input.client.r2?.put(r2().name, key, value),
      delete: async (key: string) => await input.client.r2?.delete?.(r2().name, key),
    },
    cache: {
      get: async (key: string) => await input.client.kv?.get(kv().name, key),
      set: async (key: string, value: unknown) => await input.client.kv?.put(kv().name, key, value),
    },
    db: {
      query: async (statement: string, params?: readonly unknown[]) =>
        await input.client.d1?.query(d1().name, statement, params),
    },
    jobs: {
      run: async (path: string, value: unknown) =>
        await input.client.worker?.fetch(worker().name, path, {
          method: "POST",
          body: JSON.stringify(value),
        }),
    },
    apps: {
      fetch: async (path: string, init?: RequestInit) =>
        await input.client.worker?.fetch(worker().name, path, init),
    },
    ai: {
      run: async (model: string, value: unknown) =>
        await input.client.ai?.run(aiGateway().name, model, value),
    },
  } as const
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
