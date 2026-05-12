import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  createCloudflareProvisioningPlan,
  createCloudflareRuntimeAdapter,
} from "@hrbr/runtime-cloudflare"
import {
  createHarborLocalSubmissionSnapshot,
  createHarborLocalToolIndex,
  ensureHarborLocalDaemonConnection,
  generateHarborLocalPluginPackageManifest,
  generateHarborLocalWorkflowPackageManifest,
  harborLocalDaemonConnection,
  readHarborLocalRuntimeManifest,
  runHarborLocalJob,
  runHarborLocalWorkflow,
  validateHarborLocalSubmission,
} from "@hrbr/runtime-local"

async function main() {
  const projectRoot = await mkdtemp(join(tmpdir(), "harbor-sdk-platform-example-"))
  const daemon = await ensureHarborLocalDaemonConnection({
    projectRoot,
    runtimeVersion: "example",
  })
  try {
    const manifest = await readHarborLocalRuntimeManifest(projectRoot)
    if (!manifest.manifest) throw new Error("Local daemon manifest was not written")

    const beachConnection = harborLocalDaemonConnection(manifest.manifest)
    const tools = createHarborLocalToolIndex([
      {
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        searchText: "github issue create",
      },
    ], {
      callTool: (input) => ({
        toolId: input.toolId,
        output: { issueId: "ISSUE-1", input: input.input },
      }),
    })

    const job = await runHarborLocalJob({
      job: {
        id: "normalize-title",
        code: "({ title: String(__harborInput.title).trim() })",
      },
      input: { title: " Login broken " },
    })

    const workflow = {
      id: "triage",
      title: "Triage",
      requiredTools: ["github.create_issue"],
      requiredSources: ["source-github"],
      steps: [
        {
          id: "normalize",
          kind: "job" as const,
          job: { id: "normalize-title", code: "({ title: String(__harborInput.title).trim() })" },
        },
        { id: "create", kind: "tool" as const, toolId: "github.create_issue" },
      ],
    }
    const workflowRun = await runHarborLocalWorkflow({
      workflow,
      input: { title: " Login broken " },
      tools,
      installedSourceRefIds: ["source-github"],
    })

    const pluginManifest = generateHarborLocalPluginPackageManifest({
      name: "github-tools",
      version: "1.0.0",
      owner: { name: "Example Dev" },
      source: { kind: "local", path: "plugins/github" },
      docs: { readme: "# GitHub Tools" },
      tests: ["bun test"],
      changelog: ["1.0.0 initial submission"],
      tools: [{
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        searchText: "github issue create",
      }],
    })
    const workflowManifest = generateHarborLocalWorkflowPackageManifest({
      name: "triage-workflow",
      version: "1.0.0",
      owner: { name: "Example Dev" },
      source: { kind: "local", path: "workflows/triage.ts" },
      workflow,
      docs: { readme: "# Triage Workflow" },
      tests: ["bun test"],
      changelog: ["1.0.0 initial submission"],
    })
    const submission = createHarborLocalSubmissionSnapshot(pluginManifest)
    const submissionValidation = validateHarborLocalSubmission(pluginManifest)

    const cloudflarePlan = createCloudflareProvisioningPlan({
      account: { accountId: "example-account" },
      desiredResources: [
        { kind: "r2_bucket", name: "harbor-artifacts" },
        { kind: "d1_database", name: "harbor-db" },
        { kind: "worker", name: "harbor-runtime" },
      ],
      currentLock: null,
    })
    const cloudflareAdapter = createCloudflareRuntimeAdapter({
      account: { accountId: "example-account" },
      connection: beachConnection,
      desiredResources: cloudflarePlan.items.map((item) => item.resource),
      fetch: async () => Response.json(cloudflarePlan),
    })

    console.log({
      daemon: beachConnection.origin,
      localJobOutput: job.output,
      localWorkflowOutput: workflowRun.output,
      pluginPackage: pluginManifest.name,
      workflowPackage: workflowManifest.name,
      submissionFiles: submission.files.map((file) => file.path),
      submissionOk: submissionValidation.ok,
      cloudflarePlanPreview: await cloudflareAdapter.plan(),
    })
  } finally {
    await daemon.close()
    await rm(projectRoot, { recursive: true, force: true })
  }
}

await main()
