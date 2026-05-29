//#region ../platform-cloudflare/src/stack.ts
const defaultHarborPlatformCloudflareBindingNames = {
	database: "DB",
	artifactBucket: "BUCKET",
	cacheNamespace: "KV",
	harborExecWorkflow: "HARBOR_EXEC_WORKFLOW",
	toolIndexWorkflow: "TOOL_INDEX_WORKFLOW",
	openApiImportWorkflow: "OPENAPI_IMPORT_WORKFLOW"
};
function harborPlatformCloudflareBindingNames(overrides = {}) {
	return {
		database: overrides.database ?? defaultHarborPlatformCloudflareBindingNames.database,
		artifactBucket: overrides.artifactBucket ?? defaultHarborPlatformCloudflareBindingNames.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaultHarborPlatformCloudflareBindingNames.cacheNamespace,
		harborExecWorkflow: Object.hasOwn(overrides, "harborExecWorkflow") ? overrides.harborExecWorkflow : defaultHarborPlatformCloudflareBindingNames.harborExecWorkflow,
		toolIndexWorkflow: Object.hasOwn(overrides, "toolIndexWorkflow") ? overrides.toolIndexWorkflow : defaultHarborPlatformCloudflareBindingNames.toolIndexWorkflow,
		openApiImportWorkflow: Object.hasOwn(overrides, "openApiImportWorkflow") ? overrides.openApiImportWorkflow : defaultHarborPlatformCloudflareBindingNames.openApiImportWorkflow,
		sessionsObject: Object.hasOwn(overrides, "sessionsObject") ? overrides.sessionsObject : defaultHarborPlatformCloudflareBindingNames.sessionsObject
	};
}
function createHarborPlatformCloudflareStackSpec(options) {
	return {
		name: options.stackName,
		bindings: harborPlatformCloudflareBindingNames(options.bindingNames)
	};
}
const defaultHarborPlatformCloudflareResourceIds = (stackName) => ({
	apiWorker: stackName + "-api",
	database: stackName + "-db",
	artifactBucket: stackName + "-artifacts",
	cacheNamespace: stackName + "-kv",
	harborExecWorkflow: stackName + "-exec-workflow",
	toolIndexWorkflow: stackName + "-tool-index-workflow",
	openApiImportWorkflow: stackName + "-openapi-import-workflow",
	sessionsObject: stackName + "-sessions"
});
const resolveHarborPlatformCloudflareResourceIds = (stackName, overrides = {}) => {
	const defaults = defaultHarborPlatformCloudflareResourceIds(stackName);
	return {
		apiWorker: overrides.apiWorker ?? defaults.apiWorker,
		database: overrides.database ?? defaults.database,
		artifactBucket: overrides.artifactBucket ?? defaults.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaults.cacheNamespace,
		harborExecWorkflow: overrides.harborExecWorkflow ?? defaults.harborExecWorkflow,
		toolIndexWorkflow: overrides.toolIndexWorkflow ?? defaults.toolIndexWorkflow,
		openApiImportWorkflow: overrides.openApiImportWorkflow ?? defaults.openApiImportWorkflow,
		sessionsObject: overrides.sessionsObject ?? defaults.sessionsObject
	};
};
const workflowBindingName = (bindings, key) => {
	if (key === "harborExec") return bindings.harborExecWorkflow;
	if (key === "toolIndex") return bindings.toolIndexWorkflow;
	return bindings.openApiImportWorkflow;
};
const workflowResourceId = (resources, key) => {
	if (key === "harborExec") return resources.harborExecWorkflow;
	if (key === "toolIndex") return resources.toolIndexWorkflow;
	return resources.openApiImportWorkflow;
};
const definedBindingNames = (bindings) => [
	bindings.database,
	bindings.artifactBucket,
	bindings.cacheNamespace,
	bindings.harborExecWorkflow,
	bindings.toolIndexWorkflow,
	bindings.openApiImportWorkflow,
	bindings.sessionsObject
].filter((binding) => typeof binding === "string" && binding.length > 0);
const duplicateValues = (values) => {
	const seen = /* @__PURE__ */ new Set();
	const duplicates = /* @__PURE__ */ new Set();
	for (const value of values) {
		if (seen.has(value)) duplicates.add(value);
		seen.add(value);
	}
	return Array.from(duplicates).sort();
};
function createHarborPlatformCloudflareStackDeclaration(options) {
	const spec = createHarborPlatformCloudflareStackSpec(options);
	const resourceIds = resolveHarborPlatformCloudflareResourceIds(options.stackName, options.resourceIds);
	const workflowEntries = Object.entries(options.workflows ?? {});
	const workflowResources = {};
	for (const [key, workflow] of workflowEntries) {
		const binding = workflowBindingName(spec.bindings, key);
		workflowResources[key] = {
			id: workflowResourceId(resourceIds, key),
			kind: "workflow",
			binding,
			metadata: {
				workflowName: workflow.workflowName,
				className: workflow.className
			}
		};
	}
	const requiredBindings = [
		spec.bindings.database,
		spec.bindings.artifactBucket,
		spec.bindings.cacheNamespace,
		...workflowEntries.flatMap(([key]) => {
			const binding = workflowBindingName(spec.bindings, key);
			return binding ? [binding] : [];
		}),
		...spec.bindings.sessionsObject ? [spec.bindings.sessionsObject] : []
	];
	const warnings = [...spec.bindings.sessionsObject ? ["sessionsObject declares a future Durable Object binding; platform-cloudflare does not provision the namespace yet."] : []];
	return {
		spec,
		resources: {
			apiWorker: {
				id: resourceIds.apiWorker,
				kind: "worker",
				metadata: { main: options.apiWorker.main }
			},
			database: {
				id: resourceIds.database,
				kind: "d1_database",
				binding: spec.bindings.database
			},
			artifactBucket: {
				id: resourceIds.artifactBucket,
				kind: "r2_bucket",
				binding: spec.bindings.artifactBucket
			},
			cacheNamespace: {
				id: resourceIds.cacheNamespace,
				kind: "kv_namespace",
				binding: spec.bindings.cacheNamespace
			},
			workflows: workflowResources,
			...spec.bindings.sessionsObject ? { sessionsObject: {
				id: resourceIds.sessionsObject,
				kind: "durable_object_namespace",
				binding: spec.bindings.sessionsObject
			} } : {}
		},
		requiredBindings,
		warnings
	};
}
function validateHarborPlatformCloudflareStackDeclaration(declaration) {
	const errors = [];
	const warnings = [...declaration.warnings];
	if (declaration.spec.name.trim().length === 0) errors.push("stackName must be a non-empty string.");
	const workerMain = declaration.resources.apiWorker.metadata?.main;
	if (!workerMain || workerMain.trim().length === 0) errors.push("apiWorker.main must be a non-empty path.");
	const duplicateBindings = duplicateValues(definedBindingNames(declaration.spec.bindings));
	for (const binding of duplicateBindings) errors.push("binding name must be unique: " + binding);
	const resourceIds = [
		declaration.resources.apiWorker.id,
		declaration.resources.database.id,
		declaration.resources.artifactBucket.id,
		declaration.resources.cacheNamespace.id,
		...Object.values(declaration.resources.workflows).map((resource) => resource.id),
		...declaration.resources.sessionsObject ? [declaration.resources.sessionsObject.id] : []
	];
	for (const id of duplicateValues(resourceIds)) errors.push("resource id must be unique: " + id);
	for (const [key, resource] of Object.entries(declaration.resources.workflows)) if (!resource.binding) errors.push(key + " workflow resource requires a workflow binding name.");
	if (declaration.requiredBindings.length === 0) errors.push("at least one platform binding must be declared.");
	return {
		ok: errors.length === 0,
		errors,
		warnings
	};
}
//#endregion
export { createHarborPlatformCloudflareStackDeclaration, createHarborPlatformCloudflareStackSpec, defaultHarborPlatformCloudflareBindingNames, defaultHarborPlatformCloudflareResourceIds, harborPlatformCloudflareBindingNames, resolveHarborPlatformCloudflareResourceIds, validateHarborPlatformCloudflareStackDeclaration };

//# sourceMappingURL=cloudflare-stack.mjs.map