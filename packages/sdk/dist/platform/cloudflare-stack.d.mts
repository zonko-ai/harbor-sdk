//#region ../platform-cloudflare/src/stack.d.ts
interface HarborPlatformCloudflareBindingNameOptions {
  readonly database?: string | undefined;
  readonly artifactBucket?: string | undefined;
  readonly cacheNamespace?: string | undefined;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface HarborPlatformCloudflareBindingNames {
  readonly database: string;
  readonly artifactBucket: string;
  readonly cacheNamespace: string;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface HarborPlatformCloudflareResourceIdOptions {
  readonly apiWorker?: string | undefined;
  readonly database?: string | undefined;
  readonly artifactBucket?: string | undefined;
  readonly cacheNamespace?: string | undefined;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface ResolvedHarborPlatformCloudflareResourceIds {
  readonly apiWorker: string;
  readonly database: string;
  readonly artifactBucket: string;
  readonly cacheNamespace: string;
  readonly harborExecWorkflow: string;
  readonly toolIndexWorkflow: string;
  readonly openApiImportWorkflow: string;
  readonly sessionsObject: string;
}
interface HarborPlatformCloudflareApiWorkerDeclarationOptions {
  readonly main: string;
}
interface HarborPlatformCloudflareWorkflowOptions {
  readonly workflowName: string;
  readonly className: string;
}
interface HarborPlatformCloudflareWorkflowDeclarations {
  readonly harborExec?: HarborPlatformCloudflareWorkflowOptions | undefined;
  readonly toolIndex?: HarborPlatformCloudflareWorkflowOptions | undefined;
  readonly openApiImport?: HarborPlatformCloudflareWorkflowOptions | undefined;
}
type HarborPlatformCloudflareWorkflowKey = 'harborExec' | 'toolIndex' | 'openApiImport';
type HarborPlatformCloudflareResourceKind = 'worker' | 'd1_database' | 'r2_bucket' | 'kv_namespace' | 'workflow' | 'durable_object_namespace';
interface HarborPlatformCloudflareResourceDeclaration {
  readonly id: string;
  readonly kind: HarborPlatformCloudflareResourceKind;
  readonly binding?: string | undefined;
  readonly metadata?: Record<string, string> | undefined;
}
interface HarborPlatformCloudflareStackSpec {
  readonly name: string;
  readonly bindings: HarborPlatformCloudflareBindingNames;
}
interface HarborPlatformCloudflareStackDeclarationOptions {
  readonly stackName: string;
  readonly bindingNames?: HarborPlatformCloudflareBindingNameOptions | undefined;
  readonly resourceIds?: HarborPlatformCloudflareResourceIdOptions | undefined;
  readonly apiWorker: HarborPlatformCloudflareApiWorkerDeclarationOptions;
  readonly workflows?: HarborPlatformCloudflareWorkflowDeclarations | undefined;
}
interface HarborPlatformCloudflareStackDeclaration {
  readonly spec: HarborPlatformCloudflareStackSpec;
  readonly resources: {
    readonly apiWorker: HarborPlatformCloudflareResourceDeclaration;
    readonly database: HarborPlatformCloudflareResourceDeclaration;
    readonly artifactBucket: HarborPlatformCloudflareResourceDeclaration;
    readonly cacheNamespace: HarborPlatformCloudflareResourceDeclaration;
    readonly workflows: Partial<Record<HarborPlatformCloudflareWorkflowKey, HarborPlatformCloudflareResourceDeclaration>>;
    readonly sessionsObject?: HarborPlatformCloudflareResourceDeclaration | undefined;
  };
  readonly requiredBindings: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}
interface HarborPlatformCloudflareStackValidation {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}
declare const defaultHarborPlatformCloudflareBindingNames: HarborPlatformCloudflareBindingNames;
declare function harborPlatformCloudflareBindingNames(overrides?: HarborPlatformCloudflareBindingNameOptions): HarborPlatformCloudflareBindingNames;
declare function createHarborPlatformCloudflareStackSpec(options: Pick<HarborPlatformCloudflareStackDeclarationOptions, 'stackName' | 'bindingNames'>): HarborPlatformCloudflareStackSpec;
declare const defaultHarborPlatformCloudflareResourceIds: (stackName: string) => ResolvedHarborPlatformCloudflareResourceIds;
declare const resolveHarborPlatformCloudflareResourceIds: (stackName: string, overrides?: HarborPlatformCloudflareResourceIdOptions) => ResolvedHarborPlatformCloudflareResourceIds;
declare function createHarborPlatformCloudflareStackDeclaration(options: HarborPlatformCloudflareStackDeclarationOptions): HarborPlatformCloudflareStackDeclaration;
declare function validateHarborPlatformCloudflareStackDeclaration(declaration: HarborPlatformCloudflareStackDeclaration): HarborPlatformCloudflareStackValidation;
//#endregion
export { HarborPlatformCloudflareApiWorkerDeclarationOptions, HarborPlatformCloudflareBindingNameOptions, HarborPlatformCloudflareBindingNames, HarborPlatformCloudflareResourceDeclaration, HarborPlatformCloudflareResourceIdOptions, HarborPlatformCloudflareResourceKind, HarborPlatformCloudflareStackDeclaration, HarborPlatformCloudflareStackDeclarationOptions, HarborPlatformCloudflareStackSpec, HarborPlatformCloudflareStackValidation, HarborPlatformCloudflareWorkflowDeclarations, HarborPlatformCloudflareWorkflowKey, HarborPlatformCloudflareWorkflowOptions, ResolvedHarborPlatformCloudflareResourceIds, createHarborPlatformCloudflareStackDeclaration, createHarborPlatformCloudflareStackSpec, defaultHarborPlatformCloudflareBindingNames, defaultHarborPlatformCloudflareResourceIds, harborPlatformCloudflareBindingNames, resolveHarborPlatformCloudflareResourceIds, validateHarborPlatformCloudflareStackDeclaration };
//# sourceMappingURL=cloudflare-stack.d.mts.map