import {
  validateHarborLocalPackageManifest,
  type HarborLocalPackageManifest,
  type HarborLocalPackageValidationResult,
} from "./package-format"

export interface HarborLocalSubmissionFile {
  readonly path: string
  readonly contents: string
}

export interface HarborLocalSubmissionSnapshot {
  readonly manifest: HarborLocalPackageManifest
  readonly files: readonly HarborLocalSubmissionFile[]
}

export interface HarborLocalSubmissionSecurityCheck {
  readonly id: string
  readonly title: string
  readonly status: "pass" | "warn" | "fail"
  readonly detail: string
}

export interface HarborLocalSubmissionValidationResult {
  readonly manifest: HarborLocalPackageValidationResult
  readonly security: readonly HarborLocalSubmissionSecurityCheck[]
  readonly ok: boolean
}

export function harborLocalSubmissionLayout(kind: HarborLocalPackageManifest["kind"]): readonly string[] {
  return [
    "harbor.package.json",
    "README.md",
    "CHANGELOG.md",
    `${kind}s/`,
    "examples/",
    "tests/",
  ]
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function createHarborLocalSubmissionSnapshot(
  manifest: HarborLocalPackageManifest
): HarborLocalSubmissionSnapshot {
  return {
    manifest,
    files: [
      { path: "harbor.package.json", contents: stableJson(manifest) },
      { path: "README.md", contents: `${manifest.docs.readme.trim()}\n` },
      { path: "CHANGELOG.md", contents: `${manifest.changelog.map((entry) => `- ${entry}`).join("\n")}\n` },
      {
        path: "OWNERS.md",
        contents: [
          `# ${manifest.name} Owners`,
          "",
          `Owner: ${manifest.owner.name}${manifest.owner.email ? ` <${manifest.owner.email}>` : ""}`,
          ...manifest.maintainers.map((maintainer) =>
            `Maintainer: ${maintainer.name}${maintainer.email ? ` <${maintainer.email}>` : ""}`
          ),
          "",
        ].join("\n"),
      },
    ],
  }
}

export function createHarborLocalSubmissionSecurityChecklist(
  manifest: HarborLocalPackageManifest
): readonly HarborLocalSubmissionSecurityCheck[] {
  const checks: HarborLocalSubmissionSecurityCheck[] = []
  checks.push({
    id: "auth-secret-values",
    title: "Auth requirements do not include raw secret values",
    status: manifest.auth?.slots.some((slot) => slot.includes("=")) ? "fail" : "pass",
    detail: "Secret slots must name credentials only; local values stay in the encrypted credential vault.",
  })
  checks.push({
    id: "scopes-declared",
    title: "Required scopes are declared",
    status: manifest.auth?.required && manifest.scopes.length === 0 ? "warn" : "pass",
    detail: "Authenticated packages should list the minimum provider scopes they need.",
  })
  checks.push({
    id: "policies-declared",
    title: "Runtime policies are declared",
    status: manifest.policies.length === 0 ? "warn" : "pass",
    detail: "Policies should describe network, storage, or destructive behavior reviewers need to inspect.",
  })
  checks.push({
    id: "tests-declared",
    title: "Validation tests are declared",
    status: manifest.tests.length === 0 ? "warn" : "pass",
    detail: "Submissions should include commands Harbor reviewers can run locally.",
  })
  return checks
}

export function validateHarborLocalSubmission(
  manifest: HarborLocalPackageManifest
): HarborLocalSubmissionValidationResult {
  const manifestResult = validateHarborLocalPackageManifest(manifest)
  const security = createHarborLocalSubmissionSecurityChecklist(manifest)
  return {
    manifest: manifestResult,
    security,
    ok: manifestResult.ok && security.every((check) => check.status !== "fail"),
  }
}
