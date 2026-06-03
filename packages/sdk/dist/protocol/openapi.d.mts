//#region ../protocol/src/openapi.d.ts
declare const HARBOR_OPENAPI_VERSION = "1.0.0";
declare const HARBOR_OPENAPI_PATH = "/openapi/harbor.v1.json";
declare const HARBOR_OPENAPI_ALIAS_PATH = "/openapi.json";
type HarborProtocolMethod = 'get' | 'post';
type HarborProtocolAuth = 'none' | 'bearer';
type HarborProtocolResponseEnvelope = 'direct' | 'api-success';
interface HarborProtocolOperation {
  readonly operationId: string;
  readonly method: HarborProtocolMethod;
  readonly path: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly description?: string | undefined;
  readonly auth: HarborProtocolAuth;
  readonly requestSchemaName?: string | undefined;
  readonly responseSchemaName: string;
  readonly responseEnvelope: HarborProtocolResponseEnvelope;
}
type JsonObject = {
  readonly [key: string]: unknown;
};
declare const harborProtocolOperations: readonly [{
  readonly operationId: "getHealth";
  readonly method: "get";
  readonly path: "/health";
  readonly tags: readonly ["Health"];
  readonly summary: "Read the shallow Harbor API health status.";
  readonly auth: "none";
  readonly responseSchemaName: "HealthResponse";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getV1Health";
  readonly method: "get";
  readonly path: "/v1/health";
  readonly tags: readonly ["Health"];
  readonly summary: "Read the shallow Harbor API health status through the v1 compatibility path.";
  readonly auth: "none";
  readonly responseSchemaName: "HealthResponse";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getHealthz";
  readonly method: "get";
  readonly path: "/healthz";
  readonly tags: readonly ["Health"];
  readonly summary: "Read the deep Harbor API health status including D1 migration readiness.";
  readonly auth: "none";
  readonly responseSchemaName: "HealthzResponse";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getV1Healthz";
  readonly method: "get";
  readonly path: "/v1/healthz";
  readonly tags: readonly ["Health"];
  readonly summary: "Read the deep Harbor API health status through the v1 compatibility path.";
  readonly auth: "none";
  readonly responseSchemaName: "HealthzResponse";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getHarborWellKnown";
  readonly method: "get";
  readonly path: "/.well-known/harbor.json";
  readonly tags: readonly ["Discovery"];
  readonly summary: "Read Harbor service discovery metadata.";
  readonly auth: "none";
  readonly responseSchemaName: "WellKnownHarbor";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getWellKnownIndex";
  readonly method: "get";
  readonly path: "/.well-known/index.json";
  readonly tags: readonly ["Discovery"];
  readonly summary: "Read the Harbor well-known index.";
  readonly auth: "none";
  readonly responseSchemaName: "WellKnownIndex";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getHarborOpenApi";
  readonly method: "get";
  readonly path: "/openapi/harbor.v1.json";
  readonly tags: readonly ["Discovery"];
  readonly summary: "Read the first-party Harbor OpenAPI document.";
  readonly auth: "none";
  readonly responseSchemaName: "OpenApiDocument";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "getOpenApiJson";
  readonly method: "get";
  readonly path: "/openapi.json";
  readonly tags: readonly ["Discovery"];
  readonly summary: "Read the first-party Harbor OpenAPI document through the conventional alias.";
  readonly description: "Compatibility alias for generic OpenAPI tooling. The canonical Harbor path remains /openapi/harbor.v1.json.";
  readonly auth: "none";
  readonly responseSchemaName: "OpenApiDocument";
  readonly responseEnvelope: "direct";
}, {
  readonly operationId: "listWorkspaces";
  readonly method: "post";
  readonly path: "/workspaces/list";
  readonly tags: readonly ["Workspaces"];
  readonly summary: "List workspaces available to the authenticated caller.";
  readonly description: "Returns the caller-specific workspace membership view. The API control plane derives the caller from the bearer token.";
  readonly auth: "bearer";
  readonly requestSchemaName: "ListWorkspacesRequest";
  readonly responseSchemaName: "ListWorkspacesResult";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "getWorkspace";
  readonly method: "post";
  readonly path: "/workspaces/get";
  readonly tags: readonly ["Workspaces"];
  readonly summary: "Read one workspace visible to the authenticated caller.";
  readonly description: "The API control plane enforces workspace scope before returning the workspace record.";
  readonly auth: "bearer";
  readonly requestSchemaName: "WorkspaceRequest";
  readonly responseSchemaName: "WorkspaceDetail";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "executePlugin";
  readonly method: "post";
  readonly path: "/plugins/execute";
  readonly tags: readonly ["Runtime"];
  readonly summary: "Execute JavaScript or TypeScript against ready Harbor sources in a workspace.";
  readonly description: "The API control plane authenticates and authorizes the caller before dispatching to the runtime execution layer.";
  readonly auth: "bearer";
  readonly requestSchemaName: "ExecuteRequest";
  readonly responseSchemaName: "ExecuteResult";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "inspectTrigger";
  readonly method: "post";
  readonly path: "/triggers/inspect";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Inspect and validate a proposed trigger before activation.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerInspectBody";
  readonly responseSchemaName: "TriggerInspectResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "activateTrigger";
  readonly method: "post";
  readonly path: "/triggers/activate";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Activate a trigger from a valid Inspect receipt.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerActivateBody";
  readonly responseSchemaName: "TriggerActivateResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "listTriggers";
  readonly method: "post";
  readonly path: "/triggers/list";
  readonly tags: readonly ["Triggers"];
  readonly summary: "List triggers in a workspace.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerListBody";
  readonly responseSchemaName: "TriggerListResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "getTrigger";
  readonly method: "post";
  readonly path: "/triggers/get";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Read one trigger.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerGetBody";
  readonly responseSchemaName: "TriggerGetResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "pauseTrigger";
  readonly method: "post";
  readonly path: "/triggers/pause";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Pause an active trigger.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerPauseResumeBody";
  readonly responseSchemaName: "TriggerStatusUpdateResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "resumeTrigger";
  readonly method: "post";
  readonly path: "/triggers/resume";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Resume a paused trigger.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerPauseResumeBody";
  readonly responseSchemaName: "TriggerStatusUpdateResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "disableTrigger";
  readonly method: "post";
  readonly path: "/triggers/disable";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Disable a trigger.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerPauseResumeBody";
  readonly responseSchemaName: "TriggerStatusUpdateResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "replayTriggerDelivery";
  readonly method: "post";
  readonly path: "/triggers/replay";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Replay a terminal trigger delivery.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerReplayBody";
  readonly responseSchemaName: "TriggerDeliveryGetResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "listTriggerDeliveries";
  readonly method: "post";
  readonly path: "/triggers/deliveries/list";
  readonly tags: readonly ["Triggers"];
  readonly summary: "List trigger deliveries in a workspace.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerDeliveriesListBody";
  readonly responseSchemaName: "TriggerDeliveriesListResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "getTriggerDelivery";
  readonly method: "post";
  readonly path: "/triggers/deliveries/get";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Read one trigger delivery.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerDeliveryGetBody";
  readonly responseSchemaName: "TriggerDeliveryGetResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "getTriggerLimits";
  readonly method: "post";
  readonly path: "/triggers/limits/get";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Read workspace trigger limits.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerLimitsGetBody";
  readonly responseSchemaName: "TriggerLimitsResponse";
  readonly responseEnvelope: "api-success";
}, {
  readonly operationId: "updateTriggerLimits";
  readonly method: "post";
  readonly path: "/triggers/limits/update";
  readonly tags: readonly ["Triggers"];
  readonly summary: "Update workspace trigger limits.";
  readonly auth: "bearer";
  readonly requestSchemaName: "TriggerLimitsUpdateBody";
  readonly responseSchemaName: "TriggerLimitsResponse";
  readonly responseEnvelope: "api-success";
}];
declare const harborOpenApiComponents: {
  readonly ApiFailure: JsonObject;
  readonly RateLimitInfo: JsonObject;
  readonly ApiRateLimitFailure: JsonObject;
  readonly HealthResponse: JsonObject;
  readonly HealthzResponse: JsonObject;
  readonly WellKnownHarbor: JsonObject;
  readonly WellKnownIndex: JsonObject;
  readonly OpenApiDocument: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly description: "OpenAPI 3 document for Harbor first-party API surfaces.";
  };
  readonly Workspace: JsonObject;
  readonly UserOnboarding: JsonObject;
  readonly WorkspaceDetail: JsonObject;
  readonly ListWorkspacesRequest: JsonObject;
  readonly WorkspaceRequest: JsonObject;
  readonly ListWorkspacesResult: JsonObject;
  readonly ApiSuccessListWorkspacesResult: JsonObject;
  readonly ApiSuccessWorkspaceDetail: JsonObject;
  readonly SourceRef: JsonObject;
  readonly ExecutionInput: JsonObject;
  readonly ExecuteRequest: JsonObject;
  readonly ExecuteWarning: JsonObject;
  readonly ExecuteResultTextContent: JsonObject;
  readonly ExecuteResultJsonContent: JsonObject;
  readonly ExecuteSkillBundleFile: JsonObject;
  readonly ExecuteSkillBundle: JsonObject;
  readonly ExecuteResultSkillBundleContent: JsonObject;
  readonly ExecuteResultContent: {
    readonly oneOf: readonly [{
      $ref: string;
    }, {
      $ref: string;
    }, {
      $ref: string;
    }];
  };
  readonly ExecuteResult: JsonObject;
  readonly ApiSuccessExecuteResult: JsonObject;
  readonly TriggerKind: JsonObject;
  readonly TriggerStatus: JsonObject;
  readonly TriggerDeliveryStatus: JsonObject;
  readonly TriggerTargetJobRef: JsonObject;
  readonly TriggerLimits: JsonObject;
  readonly TriggerInspectBody: JsonObject;
  readonly TriggerActivateBody: JsonObject;
  readonly TriggerListBody: JsonObject;
  readonly TriggerGetBody: JsonObject;
  readonly TriggerPauseResumeBody: JsonObject;
  readonly TriggerReplayBody: JsonObject;
  readonly TriggerDeliveriesListBody: JsonObject;
  readonly TriggerDeliveryGetBody: JsonObject;
  readonly TriggerLimitsGetBody: JsonObject;
  readonly TriggerLimitsUpdateBody: JsonObject;
  readonly TriggerCheck: JsonObject;
  readonly TriggerRequiredSetup: JsonObject;
  readonly TriggerRecord: JsonObject;
  readonly TriggerDeliveryRecord: JsonObject;
  readonly TriggerInspectResponse: JsonObject;
  readonly TriggerActivateResponse: JsonObject;
  readonly TriggerListResponse: JsonObject;
  readonly TriggerGetResponse: JsonObject;
  readonly TriggerStatusUpdateResponse: JsonObject;
  readonly TriggerDeliveriesListResponse: JsonObject;
  readonly TriggerDeliveryGetResponse: JsonObject;
  readonly TriggerLimitsResponse: JsonObject;
  readonly ApiSuccessTriggerInspectResponse: JsonObject;
  readonly ApiSuccessTriggerActivateResponse: JsonObject;
  readonly ApiSuccessTriggerListResponse: JsonObject;
  readonly ApiSuccessTriggerGetResponse: JsonObject;
  readonly ApiSuccessTriggerStatusUpdateResponse: JsonObject;
  readonly ApiSuccessTriggerDeliveriesListResponse: JsonObject;
  readonly ApiSuccessTriggerDeliveryGetResponse: JsonObject;
  readonly ApiSuccessTriggerLimitsResponse: JsonObject;
};
interface HarborOpenApiOptions {
  readonly serverUrl?: string | undefined;
  readonly stagingServerUrl?: string | undefined;
}
declare function createHarborOpenApiDocument(options?: HarborOpenApiOptions): {
  readonly openapi: "3.0.3";
  readonly info: {
    readonly title: "Harbor API";
    readonly version: "1.0.0";
    readonly description: "First-party Harbor API contract for discovery, health, and runtime execution ingress. Control-plane authorization remains owned by apps/api.";
  };
  readonly servers: readonly [{
    readonly url: string;
    readonly description: "Production";
  }, {
    readonly url: string;
    readonly description: "Staging";
  }];
  readonly paths: Record<string, Record<string, JsonObject>>;
  readonly components: {
    readonly securitySchemes: {
      readonly bearerAuth: {
        readonly type: "http";
        readonly scheme: "bearer";
        readonly bearerFormat: "Harbor API key or WorkOS AuthKit access token";
        readonly description: "Use a Harbor workspace API key, or a WorkOS/AuthKit access token on API routes that explicitly support WorkOS bearer authentication. Workspace authorization remains enforced by Harbor API routes.";
      };
    };
    readonly schemas: {
      readonly ApiFailure: JsonObject;
      readonly RateLimitInfo: JsonObject;
      readonly ApiRateLimitFailure: JsonObject;
      readonly HealthResponse: JsonObject;
      readonly HealthzResponse: JsonObject;
      readonly WellKnownHarbor: JsonObject;
      readonly WellKnownIndex: JsonObject;
      readonly OpenApiDocument: {
        readonly type: "object";
        readonly additionalProperties: true;
        readonly description: "OpenAPI 3 document for Harbor first-party API surfaces.";
      };
      readonly Workspace: JsonObject;
      readonly UserOnboarding: JsonObject;
      readonly WorkspaceDetail: JsonObject;
      readonly ListWorkspacesRequest: JsonObject;
      readonly WorkspaceRequest: JsonObject;
      readonly ListWorkspacesResult: JsonObject;
      readonly ApiSuccessListWorkspacesResult: JsonObject;
      readonly ApiSuccessWorkspaceDetail: JsonObject;
      readonly SourceRef: JsonObject;
      readonly ExecutionInput: JsonObject;
      readonly ExecuteRequest: JsonObject;
      readonly ExecuteWarning: JsonObject;
      readonly ExecuteResultTextContent: JsonObject;
      readonly ExecuteResultJsonContent: JsonObject;
      readonly ExecuteSkillBundleFile: JsonObject;
      readonly ExecuteSkillBundle: JsonObject;
      readonly ExecuteResultSkillBundleContent: JsonObject;
      readonly ExecuteResultContent: {
        readonly oneOf: readonly [{
          $ref: string;
        }, {
          $ref: string;
        }, {
          $ref: string;
        }];
      };
      readonly ExecuteResult: JsonObject;
      readonly ApiSuccessExecuteResult: JsonObject;
      readonly TriggerKind: JsonObject;
      readonly TriggerStatus: JsonObject;
      readonly TriggerDeliveryStatus: JsonObject;
      readonly TriggerTargetJobRef: JsonObject;
      readonly TriggerLimits: JsonObject;
      readonly TriggerInspectBody: JsonObject;
      readonly TriggerActivateBody: JsonObject;
      readonly TriggerListBody: JsonObject;
      readonly TriggerGetBody: JsonObject;
      readonly TriggerPauseResumeBody: JsonObject;
      readonly TriggerReplayBody: JsonObject;
      readonly TriggerDeliveriesListBody: JsonObject;
      readonly TriggerDeliveryGetBody: JsonObject;
      readonly TriggerLimitsGetBody: JsonObject;
      readonly TriggerLimitsUpdateBody: JsonObject;
      readonly TriggerCheck: JsonObject;
      readonly TriggerRequiredSetup: JsonObject;
      readonly TriggerRecord: JsonObject;
      readonly TriggerDeliveryRecord: JsonObject;
      readonly TriggerInspectResponse: JsonObject;
      readonly TriggerActivateResponse: JsonObject;
      readonly TriggerListResponse: JsonObject;
      readonly TriggerGetResponse: JsonObject;
      readonly TriggerStatusUpdateResponse: JsonObject;
      readonly TriggerDeliveriesListResponse: JsonObject;
      readonly TriggerDeliveryGetResponse: JsonObject;
      readonly TriggerLimitsResponse: JsonObject;
      readonly ApiSuccessTriggerInspectResponse: JsonObject;
      readonly ApiSuccessTriggerActivateResponse: JsonObject;
      readonly ApiSuccessTriggerListResponse: JsonObject;
      readonly ApiSuccessTriggerGetResponse: JsonObject;
      readonly ApiSuccessTriggerStatusUpdateResponse: JsonObject;
      readonly ApiSuccessTriggerDeliveriesListResponse: JsonObject;
      readonly ApiSuccessTriggerDeliveryGetResponse: JsonObject;
      readonly ApiSuccessTriggerLimitsResponse: JsonObject;
    };
  };
  readonly tags: readonly [{
    readonly name: "Discovery";
    readonly description: "Unauthenticated discovery documents.";
  }, {
    readonly name: "Health";
    readonly description: "Operational health checks.";
  }, {
    readonly name: "Workspaces";
    readonly description: "Authenticated workspace control-plane resources.";
  }, {
    readonly name: "Runtime";
    readonly description: "Workspace-scoped execution ingress.";
  }];
};
declare const harborOpenApiDocument: {
  readonly openapi: "3.0.3";
  readonly info: {
    readonly title: "Harbor API";
    readonly version: "1.0.0";
    readonly description: "First-party Harbor API contract for discovery, health, and runtime execution ingress. Control-plane authorization remains owned by apps/api.";
  };
  readonly servers: readonly [{
    readonly url: string;
    readonly description: "Production";
  }, {
    readonly url: string;
    readonly description: "Staging";
  }];
  readonly paths: Record<string, Record<string, JsonObject>>;
  readonly components: {
    readonly securitySchemes: {
      readonly bearerAuth: {
        readonly type: "http";
        readonly scheme: "bearer";
        readonly bearerFormat: "Harbor API key or WorkOS AuthKit access token";
        readonly description: "Use a Harbor workspace API key, or a WorkOS/AuthKit access token on API routes that explicitly support WorkOS bearer authentication. Workspace authorization remains enforced by Harbor API routes.";
      };
    };
    readonly schemas: {
      readonly ApiFailure: JsonObject;
      readonly RateLimitInfo: JsonObject;
      readonly ApiRateLimitFailure: JsonObject;
      readonly HealthResponse: JsonObject;
      readonly HealthzResponse: JsonObject;
      readonly WellKnownHarbor: JsonObject;
      readonly WellKnownIndex: JsonObject;
      readonly OpenApiDocument: {
        readonly type: "object";
        readonly additionalProperties: true;
        readonly description: "OpenAPI 3 document for Harbor first-party API surfaces.";
      };
      readonly Workspace: JsonObject;
      readonly UserOnboarding: JsonObject;
      readonly WorkspaceDetail: JsonObject;
      readonly ListWorkspacesRequest: JsonObject;
      readonly WorkspaceRequest: JsonObject;
      readonly ListWorkspacesResult: JsonObject;
      readonly ApiSuccessListWorkspacesResult: JsonObject;
      readonly ApiSuccessWorkspaceDetail: JsonObject;
      readonly SourceRef: JsonObject;
      readonly ExecutionInput: JsonObject;
      readonly ExecuteRequest: JsonObject;
      readonly ExecuteWarning: JsonObject;
      readonly ExecuteResultTextContent: JsonObject;
      readonly ExecuteResultJsonContent: JsonObject;
      readonly ExecuteSkillBundleFile: JsonObject;
      readonly ExecuteSkillBundle: JsonObject;
      readonly ExecuteResultSkillBundleContent: JsonObject;
      readonly ExecuteResultContent: {
        readonly oneOf: readonly [{
          $ref: string;
        }, {
          $ref: string;
        }, {
          $ref: string;
        }];
      };
      readonly ExecuteResult: JsonObject;
      readonly ApiSuccessExecuteResult: JsonObject;
      readonly TriggerKind: JsonObject;
      readonly TriggerStatus: JsonObject;
      readonly TriggerDeliveryStatus: JsonObject;
      readonly TriggerTargetJobRef: JsonObject;
      readonly TriggerLimits: JsonObject;
      readonly TriggerInspectBody: JsonObject;
      readonly TriggerActivateBody: JsonObject;
      readonly TriggerListBody: JsonObject;
      readonly TriggerGetBody: JsonObject;
      readonly TriggerPauseResumeBody: JsonObject;
      readonly TriggerReplayBody: JsonObject;
      readonly TriggerDeliveriesListBody: JsonObject;
      readonly TriggerDeliveryGetBody: JsonObject;
      readonly TriggerLimitsGetBody: JsonObject;
      readonly TriggerLimitsUpdateBody: JsonObject;
      readonly TriggerCheck: JsonObject;
      readonly TriggerRequiredSetup: JsonObject;
      readonly TriggerRecord: JsonObject;
      readonly TriggerDeliveryRecord: JsonObject;
      readonly TriggerInspectResponse: JsonObject;
      readonly TriggerActivateResponse: JsonObject;
      readonly TriggerListResponse: JsonObject;
      readonly TriggerGetResponse: JsonObject;
      readonly TriggerStatusUpdateResponse: JsonObject;
      readonly TriggerDeliveriesListResponse: JsonObject;
      readonly TriggerDeliveryGetResponse: JsonObject;
      readonly TriggerLimitsResponse: JsonObject;
      readonly ApiSuccessTriggerInspectResponse: JsonObject;
      readonly ApiSuccessTriggerActivateResponse: JsonObject;
      readonly ApiSuccessTriggerListResponse: JsonObject;
      readonly ApiSuccessTriggerGetResponse: JsonObject;
      readonly ApiSuccessTriggerStatusUpdateResponse: JsonObject;
      readonly ApiSuccessTriggerDeliveriesListResponse: JsonObject;
      readonly ApiSuccessTriggerDeliveryGetResponse: JsonObject;
      readonly ApiSuccessTriggerLimitsResponse: JsonObject;
    };
  };
  readonly tags: readonly [{
    readonly name: "Discovery";
    readonly description: "Unauthenticated discovery documents.";
  }, {
    readonly name: "Health";
    readonly description: "Operational health checks.";
  }, {
    readonly name: "Workspaces";
    readonly description: "Authenticated workspace control-plane resources.";
  }, {
    readonly name: "Runtime";
    readonly description: "Workspace-scoped execution ingress.";
  }];
};
declare function stableJsonStringify(value: unknown, space?: number): string;
//#endregion
export { HARBOR_OPENAPI_ALIAS_PATH, HARBOR_OPENAPI_PATH, HARBOR_OPENAPI_VERSION, HarborOpenApiOptions, HarborProtocolAuth, HarborProtocolMethod, HarborProtocolOperation, HarborProtocolResponseEnvelope, createHarborOpenApiDocument, harborOpenApiComponents, harborOpenApiDocument, harborProtocolOperations, stableJsonStringify };
//# sourceMappingURL=openapi.d.mts.map