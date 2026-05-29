//#region ../protocol/src/stainless.d.ts
declare function createHarborStainlessConfig(): {
  readonly organization: {
    readonly name: "harbor";
    readonly docs: "https://tryharbor.ai/docs";
  };
  readonly targets: {
    readonly python: {
      readonly package_name: "harbor_sdk_generated";
    };
  };
  readonly client_settings: {
    readonly opts: {
      readonly bearer_token: {
        readonly type: "string";
        readonly auth: {
          readonly security_scheme: "bearerAuth";
        };
        readonly read_env: "HARBOR_API_KEY";
      };
    };
  };
  readonly environments: {
    readonly production: "https://api.tryharbor.ai";
    readonly staging: "https://stagapi.tryharbor.ai";
  };
  readonly resources: {
    readonly health: {
      readonly methods: {
        readonly retrieve: "get /health" | "get /v1/health" | "get /healthz" | "get /v1/healthz" | "get /.well-known/harbor.json" | "get /.well-known/index.json" | "get /openapi/harbor.v1.json" | "get /openapi.json" | "get /workspaces/list" | "get /workspaces/get" | "get /plugins/execute" | "get /triggers/inspect" | "get /triggers/activate" | "get /triggers/list" | "get /triggers/get" | "get /triggers/pause" | "get /triggers/resume" | "get /triggers/disable" | "get /triggers/replay" | "get /triggers/deliveries/list" | "get /triggers/deliveries/get" | "get /triggers/limits/get" | "get /triggers/limits/update" | "post /health" | "post /v1/health" | "post /healthz" | "post /v1/healthz" | "post /.well-known/harbor.json" | "post /.well-known/index.json" | "post /openapi/harbor.v1.json" | "post /openapi.json" | "post /workspaces/list" | "post /workspaces/get" | "post /plugins/execute" | "post /triggers/inspect" | "post /triggers/activate" | "post /triggers/list" | "post /triggers/get" | "post /triggers/pause" | "post /triggers/resume" | "post /triggers/disable" | "post /triggers/replay" | "post /triggers/deliveries/list" | "post /triggers/deliveries/get" | "post /triggers/limits/get" | "post /triggers/limits/update";
        readonly retrieve_deep: "get /health" | "get /v1/health" | "get /healthz" | "get /v1/healthz" | "get /.well-known/harbor.json" | "get /.well-known/index.json" | "get /openapi/harbor.v1.json" | "get /openapi.json" | "get /workspaces/list" | "get /workspaces/get" | "get /plugins/execute" | "get /triggers/inspect" | "get /triggers/activate" | "get /triggers/list" | "get /triggers/get" | "get /triggers/pause" | "get /triggers/resume" | "get /triggers/disable" | "get /triggers/replay" | "get /triggers/deliveries/list" | "get /triggers/deliveries/get" | "get /triggers/limits/get" | "get /triggers/limits/update" | "post /health" | "post /v1/health" | "post /healthz" | "post /v1/healthz" | "post /.well-known/harbor.json" | "post /.well-known/index.json" | "post /openapi/harbor.v1.json" | "post /openapi.json" | "post /workspaces/list" | "post /workspaces/get" | "post /plugins/execute" | "post /triggers/inspect" | "post /triggers/activate" | "post /triggers/list" | "post /triggers/get" | "post /triggers/pause" | "post /triggers/resume" | "post /triggers/disable" | "post /triggers/replay" | "post /triggers/deliveries/list" | "post /triggers/deliveries/get" | "post /triggers/limits/get" | "post /triggers/limits/update";
      };
    };
    readonly runtime: {
      readonly methods: {
        readonly execute: "get /health" | "get /v1/health" | "get /healthz" | "get /v1/healthz" | "get /.well-known/harbor.json" | "get /.well-known/index.json" | "get /openapi/harbor.v1.json" | "get /openapi.json" | "get /workspaces/list" | "get /workspaces/get" | "get /plugins/execute" | "get /triggers/inspect" | "get /triggers/activate" | "get /triggers/list" | "get /triggers/get" | "get /triggers/pause" | "get /triggers/resume" | "get /triggers/disable" | "get /triggers/replay" | "get /triggers/deliveries/list" | "get /triggers/deliveries/get" | "get /triggers/limits/get" | "get /triggers/limits/update" | "post /health" | "post /v1/health" | "post /healthz" | "post /v1/healthz" | "post /.well-known/harbor.json" | "post /.well-known/index.json" | "post /openapi/harbor.v1.json" | "post /openapi.json" | "post /workspaces/list" | "post /workspaces/get" | "post /plugins/execute" | "post /triggers/inspect" | "post /triggers/activate" | "post /triggers/list" | "post /triggers/get" | "post /triggers/pause" | "post /triggers/resume" | "post /triggers/disable" | "post /triggers/replay" | "post /triggers/deliveries/list" | "post /triggers/deliveries/get" | "post /triggers/limits/get" | "post /triggers/limits/update";
      };
    };
  };
};
declare function stringifyHarborStainlessConfig(): string;
//#endregion
export { createHarborStainlessConfig, stringifyHarborStainlessConfig };
//# sourceMappingURL=stainless.d.mts.map