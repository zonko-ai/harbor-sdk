# 10 — `orbit.jobs.*` and Harbor job surfaces

`@hrbr/orbit/jobs` will own contracts for workspace-scoped named functions. Jobs are the unit that agents discover, inspect, publish, and run through Coast or Lighthouse.

## Purpose

A job is a named, versioned function in a workspace catalog. It has a typed input schema, optional output schema, declared Orbit capabilities, a code reference, and an execution lane.

Jobs are not a raw Worker, raw Dynamic Worker, raw workflow, or arbitrary SQL/script registry. They are Harbor-owned callable functions that run through the existing execution layer.

## Agent interaction boundary

LLMs and agents interact with jobs only through Harbor product surfaces:

- Coast CLI: `hrbr job ...`
- Lighthouse MCP: `jobs` tool
- later orchestration steps can invoke jobs
- later exec code may call `orbit.jobs.run(name, input)` only after the job catalog contract is stable

They do not interact with internal API routes, D1 tables, Workers for Platforms dispatch namespaces, Dynamic Worker loaders, raw R2 keys, or raw executor bindings.

## Job definition code shape

A job file exports a definition with input/output schemas and a handler. The handler receives a constrained Orbit context, not raw Cloudflare bindings.

```ts
import { Schema } from "effect"
import { defineOrbitJob } from "@hrbr/orbit/jobs"

export default defineOrbitJob({
  name: "extract-action-items",
  description: "Extract action items from a stored text artifact.",
  input: Schema.Struct({
    key: Schema.String,
  }),
  output: Schema.Struct({
    items: Schema.Array(
      Schema.Struct({
        text: Schema.String,
        owner: Schema.optional(Schema.String),
      }),
    ),
  }),
  capabilities: ["storage", "ai"],

  async handler(ctx, input) {
    const artifact = await ctx.orbit.storage.get(input.key)
    const result = await ctx.orbit.ai.generate({
      prompt: "Extract action items as JSON.",
      input: artifact?.data ?? "",
    })
    return result.json
  },
})
```

No-input jobs should use an explicit empty/void input contract rather than relying on ad hoc missing input behavior.

## Proposed SDK contracts

```ts
OrbitJobName
OrbitJobVersion
OrbitJobCapability
OrbitJobStatus
OrbitJobExecutionLane
OrbitJobSourceRef
OrbitJobDefinition
OrbitJobVersionRecord
OrbitJobListBody
OrbitJobListResponse
OrbitJobInspectBody
OrbitJobInspectResponse
OrbitJobPublishBody
OrbitJobPublishResponse
OrbitJobRunBody
OrbitJobRunResponse
OrbitJobDisableBody
OrbitJobDisableResponse
```

Execution lanes:

```text
sandbox           current/near-term Dynamic Worker / sandbox execution
worker_platform   future promoted reusable Worker lane
container         future heavy/native lane
local_host        future local execution lane
```

Public invocation should not depend on the lane. A caller runs `extract-action-items`; Harbor decides whether the current version is sandbox-backed, Workers-for-Platforms-backed, or another lane.

## Coast surface

Coast is the primary CLI surface for agents running in a terminal.

```text
hrbr job list [--json]
hrbr job inspect <name[@version]> [--json]
hrbr job publish <file|-> [--name <name>] [--description <text>] [--json]
hrbr job run <name[@version]> [--input <json>] [--json]
hrbr job versions <name> [--json]
hrbr job disable <name>
```

Examples:

```bash
hrbr job publish ./jobs/extract-action-items.ts
hrbr job inspect extract-action-items --json
hrbr job run extract-action-items --input '{"key":"meetings/standup.txt"}' --json
```

`inspect --json` is the main LLM discovery surface. It must return name, description, latest version, status, input schema, output schema, capabilities, and version list.

## Lighthouse MCP surface

Lighthouse should expose jobs as a first-class tool, not hide them under `exec`.

Tool name:

```text
jobs
```

Actions:

```ts
const JOBS_ACTIONS = [
  "list",
  "inspect",
  "publish",
  "run",
  "versions",
  "disable",
] as const
```

### `jobs.list`

Input:

```json
{ "action": "list" }
```

Output:

```json
{
  "action": "list",
  "jobs": [
    {
      "name": "extract-action-items",
      "description": "Extract action items from a stored text artifact.",
      "latest_version": "v1",
      "status": "ready",
      "capabilities": ["storage", "ai"]
    }
  ],
  "count": 1,
  "next_step": "Use jobs action=inspect name=<job> to view input_schema before running."
}
```

### `jobs.inspect`

Input:

```json
{ "action": "inspect", "name": "extract-action-items" }
```

Output must include the exact input schema and output schema if present.

### `jobs.run`

Input:

```json
{
  "action": "run",
  "name": "extract-action-items",
  "input": { "key": "meetings/standup.txt" }
}
```

Output:

```json
{
  "action": "run",
  "ok": true,
  "job": "extract-action-items",
  "version": "v1",
  "run_id": "run_123",
  "duration_ms": 842,
  "output": {},
  "artifacts": []
}
```

### `jobs.publish`

Lighthouse publishing must support inline code or references, because MCP clients do not have direct access to local files.

```json
{
  "action": "publish",
  "name": "extract-action-items",
  "description": "Extract action items from a stored text artifact.",
  "source": {
    "kind": "inline",
    "code": "...job module source..."
  }
}
```

Allowed source kinds:

```text
inline
storage_ref
```

## Server route shape

The exact route layout may change, but the contract should cover at least:

```text
POST /orbit/jobs/list
POST /orbit/jobs/inspect
POST /orbit/jobs/publish
POST /orbit/jobs/run
POST /orbit/jobs/versions
POST /orbit/jobs/disable
```

`publish` stores a new immutable job version. `run` resolves a ready version and creates a Harbor run/invocation record.

## Canonical records

D1 remains canonical for job catalog metadata:

```text
orbit_jobs
orbit_job_versions
orbit_job_invocations
```

Minimum fields:

```text
job: workspace_id, name, description, status, created_by, timestamps
version: job_id, version, code_ref, code_hash, schemas, capabilities, lane, policy, status
invocation: job_id, version_id, run_id, caller kind/id, input, output, status, error, timestamps
```

Code bytes should live behind Harbor storage/R2 refs. D1 stores metadata and refs, not large source blobs.

## Execution model

Running a job performs these steps:

1. Resolve workspace scope and caller authority.
2. Resolve job name/version to a ready immutable version.
3. Validate input against the stored input schema.
4. Require declared capabilities before user code runs.
5. Create a Harbor run/invocation record.
6. Load code from `code_ref`.
7. Execute through the selected lane with existing Orbit host dispatch.
8. Validate output when an output schema exists.
9. Persist output/artifacts/usage and return Coast/Lighthouse-shaped output.

## Workers for Platforms fit

Workers for Platforms is not the default job model. It is a future execution lane for promoted, reusable job versions.

```text
sandbox lane          one-off or normal published job execution
worker_platform lane  promoted reusable workspace Worker version
```

A job version may later be promoted to `worker_platform`, but the Coast/Lighthouse invocation remains the same:

```bash
hrbr job run extract-action-items --input '{"key":"meetings/standup.txt"}'
```

Do not create/update/delete a Workers for Platforms user Worker for every normal job run.

## Workflow fit

Workflows orchestrate jobs. Jobs are callable functions.

A future orchestration layer may invoke a job by name/version and attach the child run output as a step result. Job invocation history remains immutable.

## Output control

- CLI output must support both human formatting and `--json`.
- MCP output must return structured content suitable for tool clients.
- Job output should be schema-validated if the job defines an output schema.
- Large outputs should be written to storage/artifacts and returned as refs.

## Non-goals

- No raw `/plugins/execute` code generation required to call a job.
- No direct Workers for Platforms dispatch namespace exposure.
- No raw Dynamic Worker loader exposure.
- No raw D1 table access.
- No raw R2 key or bucket exposure.
- No public job creation through sandbox runtime until catalog/policy semantics are stable.

## Source documents

Start future job research and implementation from:

- `apps/coast/src/commands-effect/exec.ts` — Coast command style and Effect CLI patterns.
- `apps/coast/src/exec/remote.ts` — current remote execution envelope and output behavior.
- `apps/lighthouse/src/tools/index.ts` — current MCP tool registry and schema style.
- `apps/lighthouse/src/tools/exec.ts` — current Lighthouse synchronous exec behavior and task envelope support.
- `packages/sdk/harbor-control/src/tools.ts` — shared Lighthouse tool/action catalog.
- `apps/api/src/routes/plugins/execute.ts` — current execution route and run creation pattern.
- `apps/api/src/plugins/sandbox/index.ts` — current sandbox execution lane.
- `packages/sdk/orbit/SPEC.md` — Orbit capability boundary.
- [Usage](./01-usage.spec.md) — job publish/run/version operations need audit events.
- `docs/contracts/coast-cli.md` — Coast UX contract.
- `docs/architecture/execution-layer-shape.md` — control-plane and execution-lane separation.
- `docs/architecture/tiered-execution-design.md` — execution lane evolution.
- `https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/` — later worker-platform lane context.
- `https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/` — later worker egress policy context.

## Cross-links

- [Usage](./01-usage.spec.md)
- [Storage](./02-storage.spec.md)
