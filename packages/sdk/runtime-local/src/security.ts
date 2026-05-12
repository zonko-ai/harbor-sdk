import type { HarborLocalPackageManifest } from "./package-format"

export type HarborLocalSecurityActionKind =
  | "local.delete"
  | "cloudflare.mutate"
  | "tool.run"
  | "credentials.change"
  | "package.publish"

export interface HarborLocalSecurityAction {
  readonly kind: HarborLocalSecurityActionKind
  readonly title: string
  readonly destructive: boolean
  readonly requiresConfirmation: boolean
  readonly metadata?: Readonly<Record<string, unknown>> | undefined
}

export interface HarborLocalConfirmationInput {
  readonly action: HarborLocalSecurityAction
  readonly confirmed: boolean
}

export interface HarborLocalStaticCheck {
  readonly id: string
  readonly status: "pass" | "warn" | "fail"
  readonly message: string
}

export function requireHarborLocalConfirmation(input: HarborLocalConfirmationInput): void {
  if (input.action.requiresConfirmation && !input.confirmed) {
    throw new Error(`Confirmation required for ${input.action.kind}: ${input.action.title}`)
  }
}

export function harborLocalSecurityAction(input: {
  readonly kind: HarborLocalSecurityActionKind
  readonly title: string
  readonly destructive?: boolean | undefined
  readonly metadata?: Readonly<Record<string, unknown>> | undefined
}): HarborLocalSecurityAction {
  const destructive = input.destructive ?? (
    input.kind === "local.delete" ||
    input.kind === "cloudflare.mutate" ||
    input.kind === "credentials.change" ||
    input.kind === "package.publish"
  )
  return {
    kind: input.kind,
    title: input.title,
    destructive,
    requiresConfirmation: destructive,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  }
}

export function runHarborLocalStaticSecurityChecks(
  manifest: HarborLocalPackageManifest
): readonly HarborLocalStaticCheck[] {
  const checks: HarborLocalStaticCheck[] = []
  checks.push({
    id: "secret-leakage",
    status: JSON.stringify(manifest).match(/(sk_live_|-----BEGIN|password=|token=)/i) ? "fail" : "pass",
    message: "Manifest must not contain raw secrets, private keys, passwords, or token assignments.",
  })
  checks.push({
    id: "unsafe-auth-scopes",
    status: manifest.scopes.some((scope) => /admin|write_all|\*/i.test(scope)) ? "warn" : "pass",
    message: "Broad auth scopes require reviewer attention.",
  })
  checks.push({
    id: "destructive-policy",
    status: manifest.policies.some((policy) => /delete|write|mutate|destroy/i.test(policy)) ? "warn" : "pass",
    message: "Destructive runtime policies must be explicitly reviewed.",
  })
  checks.push({
    id: "network-policy",
    status: manifest.policies.some((policy) => policy.startsWith("network:")) ? "pass" : "warn",
    message: "Network-capable packages should declare allowed hosts.",
  })
  return checks
}
