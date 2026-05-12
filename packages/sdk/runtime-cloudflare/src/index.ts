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
