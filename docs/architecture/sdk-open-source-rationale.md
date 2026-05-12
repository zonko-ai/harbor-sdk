# Why Open Source the Harbor SDK / XTK

Harbor should open source the extracted SDK/XTK as the public developer toolkit, not the full Harbor main repo. The goal is to give developers a low-friction way to adopt Harbor primitives, build extensions, and use infrastructure-backed capabilities without cloning or operating the entire Harbor product.

The main repo is Harbor's hosted product implementation: dashboard, API worker, auth, workspace administration, migrations, hosted execution, registry operations, observability, deployment topology, and internal product choices. The SDK/XTK should be the public platform contract.

## 1. Local-First Harbor

The SDK can give developers a local version of the Harbor experience that is easy to install and safe to try.

Everything can live on the user's machine: local config, credentials, source definitions, tool registry, traces, workflow state, and test data. This creates an adoption path where developers do not need to sign into Harbor Cloud or understand the hosted control plane before seeing value.

This local-first mode does not need full Orbit. Orbit is Cloudflare-backed by design, so the SDK can provide simpler local equivalents:

- local credential stores instead of hosted secrets
- local tool registries instead of hosted plugin installs
- local traces instead of hosted run history
- local file/blob storage instead of R2
- local cache instead of KV
- local SQLite/in-memory state instead of D1
- BM25/lexical search instead of Vectorize
- mock AI/tool/runtime adapters for tests

This gives developers a simple starting point: build and run useful agent/tool workflows locally, then move to Harbor Cloud or Cloudflare-backed adapters when they need hosted execution, collaboration, persistence, scale, or governance.

## 2. Extension Authoring Platform

The SDK should be the easiest way to build Harbor-compatible plugins, sources, workflows, jobs, and apps before submitting or publishing them to Harbor.

Developers should be able to author and test extensions in their own repos, with local validation, local credentials, local tool calls, manifest generation, and mock runtime support. Harbor Cloud can remain the place where extensions are reviewed, installed, permissioned, executed, and observed.

Instead of asking Harbor to build every missing plugin or workflow, developers can create their own extension in a Git repo and submit it for review. Harbor can review, test, and merge the extension into the curated registry when it meets quality, security, and maintenance standards. This shifts plugin and workflow growth from a Harbor-only backlog to a community contribution loop.

This pattern already exists in the product shape:

- Coast lets users publish and run jobs/apps from files.
- Beach lets agents discover and run Harbor tools through MCP.
- The SDK already has source adapters, tool registries, policies, credential primitives, workflow contracts, run traces, and Orbit app/job contracts.
- Harbor's hosted registry can remain curated while third-party developers build extension packages outside the main repo.
- Git-based submissions make plugin and workflow maintenance easier: authors can own fixes, updates, docs, and compatibility changes before Harbor promotes them to the shared catalog.

Examples of what developers can build:

- a private company plugin for an internal CRM
- a workflow that triages GitHub issues and creates Linear tickets
- a job that syncs SaaS data on a schedule
- an app that exposes an approval queue or workflow launcher
- a source adapter for an MCP server, OpenAPI API, CLI, or internal service

This makes Harbor more extensible without turning the main repo into the public contribution surface.

## 3. Simple Layer Over Cloudflare Infrastructure

The SDK can also position Harbor as an easier way to build on Cloudflare.

Developers often want the benefits of Cloudflare services without managing every primitive directly. With the SDK/XTK, they can build agents and apps against higher-level Harbor concepts, then connect their own Cloudflare account or use Harbor-managed infrastructure underneath.

Orbit becomes the developer-friendly layer over complex infrastructure:

- storage maps to blob/artifact use cases instead of raw R2 setup
- cache maps to fast scoped state instead of raw KV wiring
- db maps to application state instead of hand-managed D1 access
- ai maps to model calls and embeddings instead of provider setup
- jobs map to callable functions instead of raw Workers/Queues orchestration
- apps map to hosted UI surfaces instead of full frontend deployment
- sockets map to realtime rooms instead of direct Durable Object design
- semantic search can map to Vectorize-backed retrieval when needed

Examples:

- an AI agent that stores artifacts, caches API responses, and records traces
- a support dashboard backed by workspace data and scheduled sync jobs
- a document-processing app that stores files, extracts summaries, and exposes review UI
- a developer tool that indexes local or hosted registries with lexical search locally and vector search when Cloudflare is connected
- a workflow product that starts local and later moves to Cloudflare-backed execution without changing its authoring model

This is the strongest GTM story: developers can start local, build Harbor-compatible extensions, and graduate to Cloudflare-backed scale through the same SDK primitives.

## Summary

Open sourcing the SDK/XTK grows the developer ecosystem around Harbor's contracts. Open sourcing the main repo would shift attention toward self-hosting and operating Harbor.

The SDK is the adoption surface. The main repo is the product implementation.
