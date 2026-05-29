import { Context } from "effect";
//#region ../core-effect/src/services.ts
var WorkspaceAuthorizationError = class extends Error {
	workspaceId;
	action;
	reason;
	_tag = "WorkspaceAuthorizationError";
	constructor(workspaceId, action, reason) {
		super(reason);
		this.workspaceId = workspaceId;
		this.action = action;
		this.reason = reason;
		this.name = "WorkspaceAuthorizationError";
	}
};
const WorkspaceAuthorizer = Context.Service("@hrbr/core/WorkspaceAuthorizer");
var RunStoreError = class extends Error {
	reason;
	_tag = "RunStoreError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "RunStoreError";
	}
};
const RunStore = Context.Service("@hrbr/core/RunStore");
var CredentialStoreError = class extends Error {
	reason;
	_tag = "CredentialStoreError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "CredentialStoreError";
	}
};
const CredentialStore = Context.Service("@hrbr/core/CredentialStore");
var SourceRegistryError = class extends Error {
	reason;
	_tag = "SourceRegistryError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "SourceRegistryError";
	}
};
const SourceRegistry = Context.Service("@hrbr/core/SourceRegistry");
var McpSessionPoolError = class extends Error {
	reason;
	_tag = "McpSessionPoolError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "McpSessionPoolError";
	}
};
const McpSessionPool = Context.Service("@hrbr/core/McpSessionPool");
var RuntimeExecutorError = class extends Error {
	reason;
	_tag = "RuntimeExecutorError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "RuntimeExecutorError";
	}
};
const RuntimeExecutor = Context.Service("@hrbr/core/RuntimeExecutor");
var ArtifactStoreError = class extends Error {
	reason;
	_tag = "ArtifactStoreError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "ArtifactStoreError";
	}
};
const ArtifactStore = Context.Service("@hrbr/core/ArtifactStore");
var ToolCatalogError = class extends Error {
	reason;
	_tag = "ToolCatalogError";
	constructor(reason) {
		super(reason);
		this.reason = reason;
		this.name = "ToolCatalogError";
	}
};
const ToolCatalog = Context.Service("@hrbr/core/ToolCatalog");
//#endregion
export { ArtifactStore, ArtifactStoreError, CredentialStore, CredentialStoreError, McpSessionPool, McpSessionPoolError, RunStore, RunStoreError, RuntimeExecutor, RuntimeExecutorError, SourceRegistry, SourceRegistryError, ToolCatalog, ToolCatalogError, WorkspaceAuthorizationError, WorkspaceAuthorizer };

//# sourceMappingURL=services.mjs.map