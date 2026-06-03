import { Schema } from "effect";

//#region ../registry/src/types.d.ts
declare const PluginCategory: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
type PluginCategory = typeof PluginCategory.Type;
declare const PluginRegistryManifestToolBinding: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly tool_name: Schema.String;
  readonly cached_input_schema: Schema.optional<Schema.Unknown>;
  readonly cached_output_schema: Schema.optional<Schema.Unknown>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli_command">;
  readonly tool_name: Schema.String;
  readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"option">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
    readonly omit_if_empty: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"flag">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
  }>]>>;
  readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
  readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly streaming: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_request">;
  readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
  readonly path: Schema.NonEmptyString;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly body_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_graphql">;
  readonly path: Schema.optional<Schema.NonEmptyString>;
  readonly document: Schema.NonEmptyString;
  readonly operation_name: Schema.optional<Schema.NonEmptyString>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly variables_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>]>;
type PluginRegistryManifestToolBinding = typeof PluginRegistryManifestToolBinding.Type;
declare const PluginRegistryManifestTool: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly name: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly title: Schema.optional<Schema.String>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly annotations: Schema.optional<Schema.Unknown>;
  readonly icons: Schema.optional<Schema.Unknown>;
  readonly binding: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"mcp">;
    readonly tool_name: Schema.String;
    readonly cached_input_schema: Schema.optional<Schema.Unknown>;
    readonly cached_output_schema: Schema.optional<Schema.Unknown>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"cli_command">;
    readonly tool_name: Schema.String;
    readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"input">;
      readonly path: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"option">;
      readonly flag: Schema.NonEmptyString;
      readonly path: Schema.NonEmptyString;
      readonly omit_if_empty: Schema.optional<Schema.Boolean>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"flag">;
      readonly flag: Schema.NonEmptyString;
      readonly path: Schema.NonEmptyString;
    }>]>>;
    readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
    readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly streaming: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api_request">;
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly path: Schema.NonEmptyString;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body_template: Schema.optional<Schema.Unknown>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly auth: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
      readonly required: Schema.optional<Schema.Boolean>;
      readonly env: Schema.optional<Schema.String>;
      readonly secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly header_name: Schema.optional<Schema.String>;
      readonly query_param: Schema.optional<Schema.String>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly username_env: Schema.optional<Schema.String>;
      readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly password_env: Schema.optional<Schema.String>;
      readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
    }>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api_graphql">;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly document: Schema.NonEmptyString;
    readonly operation_name: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly variables_template: Schema.optional<Schema.Unknown>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly auth: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
      readonly required: Schema.optional<Schema.Boolean>;
      readonly env: Schema.optional<Schema.String>;
      readonly secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly header_name: Schema.optional<Schema.String>;
      readonly query_param: Schema.optional<Schema.String>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly username_env: Schema.optional<Schema.String>;
      readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly password_env: Schema.optional<Schema.String>;
      readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
    }>>;
  }>]>;
  readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
}>;
type PluginRegistryManifestTool = typeof PluginRegistryManifestTool.Type;
declare const PluginRegistryManifest: Schema.Struct<{
  readonly tools: Schema.$Array<Schema.Struct<{
    readonly tool_id: Schema.String;
    readonly name: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.optional<Schema.String>;
    readonly title: Schema.optional<Schema.String>;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly annotations: Schema.optional<Schema.Unknown>;
    readonly icons: Schema.optional<Schema.Unknown>;
    readonly binding: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"mcp">;
      readonly tool_name: Schema.String;
      readonly cached_input_schema: Schema.optional<Schema.Unknown>;
      readonly cached_output_schema: Schema.optional<Schema.Unknown>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"cli_command">;
      readonly tool_name: Schema.String;
      readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"input">;
        readonly path: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"option">;
        readonly flag: Schema.NonEmptyString;
        readonly path: Schema.NonEmptyString;
        readonly omit_if_empty: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"flag">;
        readonly flag: Schema.NonEmptyString;
        readonly path: Schema.NonEmptyString;
      }>]>>;
      readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
      readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
      readonly streaming: Schema.optional<Schema.Boolean>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"api_request">;
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly path: Schema.NonEmptyString;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body_template: Schema.optional<Schema.Unknown>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
      readonly auth: Schema.optional<Schema.Struct<{
        readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
        readonly required: Schema.optional<Schema.Boolean>;
        readonly env: Schema.optional<Schema.String>;
        readonly secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly header_name: Schema.optional<Schema.String>;
        readonly query_param: Schema.optional<Schema.String>;
        readonly prefix: Schema.optional<Schema.String>;
        readonly username_env: Schema.optional<Schema.String>;
        readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly password_env: Schema.optional<Schema.String>;
        readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
      }>>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"api_graphql">;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly document: Schema.NonEmptyString;
      readonly operation_name: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly variables_template: Schema.optional<Schema.Unknown>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
      readonly auth: Schema.optional<Schema.Struct<{
        readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
        readonly required: Schema.optional<Schema.Boolean>;
        readonly env: Schema.optional<Schema.String>;
        readonly secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly header_name: Schema.optional<Schema.String>;
        readonly query_param: Schema.optional<Schema.String>;
        readonly prefix: Schema.optional<Schema.String>;
        readonly username_env: Schema.optional<Schema.String>;
        readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly password_env: Schema.optional<Schema.String>;
        readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
      }>>;
    }>]>;
    readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  }>>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
}>;
type PluginRegistryManifest = typeof PluginRegistryManifest.Type;
declare const PluginRegistryCliSetupRequiredSecret: Schema.Struct<{
  readonly env: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly required: Schema.Boolean;
}>;
type PluginRegistryCliSetupRequiredSecret = typeof PluginRegistryCliSetupRequiredSecret.Type;
declare const PluginRegistryCliSetupRunnableRequirement: Schema.Struct<{
  readonly summary: Schema.NonEmptyString;
  readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
}>;
type PluginRegistryCliSetupRunnableRequirement = typeof PluginRegistryCliSetupRunnableRequirement.Type;
declare const PluginRegistryCliSetupVerifyProbe: Schema.Struct<{
  readonly args: Schema.$Array<Schema.NonEmptyString>;
  readonly success_message: Schema.NonEmptyString;
}>;
type PluginRegistryCliSetupVerifyProbe = typeof PluginRegistryCliSetupVerifyProbe.Type;
declare const PluginRegistryCliSetupFailureMatcher: Schema.Struct<{
  readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
  readonly pattern: Schema.NonEmptyString;
  readonly flags: Schema.optional<Schema.NonEmptyString>;
}>;
type PluginRegistryCliSetupFailureMatcher = typeof PluginRegistryCliSetupFailureMatcher.Type;
declare const PluginRegistryCliSetupFailureHint: Schema.Struct<{
  readonly matchers: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
    readonly pattern: Schema.NonEmptyString;
    readonly flags: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly message: Schema.NonEmptyString;
}>;
type PluginRegistryCliSetupFailureHint = typeof PluginRegistryCliSetupFailureHint.Type;
declare const PluginRegistryCliSetup: Schema.Struct<{
  readonly links: Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>;
  readonly required_secrets: Schema.$Array<Schema.Struct<{
    readonly env: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly required: Schema.Boolean;
  }>>;
  readonly runnable: Schema.Struct<{
    readonly summary: Schema.NonEmptyString;
    readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
  }>;
  readonly verify_probe: Schema.Struct<{
    readonly args: Schema.$Array<Schema.NonEmptyString>;
    readonly success_message: Schema.NonEmptyString;
  }>;
  readonly failure_hints: Schema.$Array<Schema.Struct<{
    readonly matchers: Schema.$Array<Schema.Struct<{
      readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
      readonly pattern: Schema.NonEmptyString;
      readonly flags: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly message: Schema.NonEmptyString;
  }>>;
}>;
type PluginRegistryCliSetup = typeof PluginRegistryCliSetup.Type;
declare const PluginRegistryApiSetupVerifyProbe: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"request">;
  readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
  readonly path: Schema.NonEmptyString;
  readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly expected_status: Schema.optional<Schema.Number>;
  readonly success_message: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"graphql">;
  readonly method: Schema.Literal<"POST">;
  readonly path: Schema.NonEmptyString;
  readonly document: Schema.NonEmptyString;
  readonly operation_name: Schema.optional<Schema.NonEmptyString>;
  readonly variables_template: Schema.optional<Schema.Unknown>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly expected_status: Schema.optional<Schema.Number>;
  readonly success_message: Schema.NonEmptyString;
}>]>;
type PluginRegistryApiSetupVerifyProbe = typeof PluginRegistryApiSetupVerifyProbe.Type;
declare const PluginRegistryApiSetup: Schema.Struct<{
  readonly links: Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>;
  readonly base_url: Schema.NonEmptyString;
  readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
  readonly required_secrets: Schema.$Array<Schema.Struct<{
    readonly env: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly required: Schema.Boolean;
  }>>;
  readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"request">;
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly path: Schema.NonEmptyString;
    readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly success_message: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"graphql">;
    readonly method: Schema.Literal<"POST">;
    readonly path: Schema.NonEmptyString;
    readonly document: Schema.NonEmptyString;
    readonly operation_name: Schema.optional<Schema.NonEmptyString>;
    readonly variables_template: Schema.optional<Schema.Unknown>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly success_message: Schema.NonEmptyString;
  }>]>;
  readonly failure_hints: Schema.$Array<Schema.Struct<{
    readonly matchers: Schema.$Array<Schema.Struct<{
      readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
      readonly pattern: Schema.NonEmptyString;
      readonly flags: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly message: Schema.NonEmptyString;
  }>>;
  readonly spec_url: Schema.optional<Schema.NonEmptyString>;
  readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
  readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
}>;
type PluginRegistryApiSetup = typeof PluginRegistryApiSetup.Type;
declare const PluginRegistryEntry: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly config: Schema.Struct<{
    readonly mcp_endpoint: Schema.NonEmptyString;
    readonly mcp_transport: Schema.Literals<readonly ["http", "sse"]>;
    readonly oauth_discovery: Schema.optional<Schema.Struct<{
      readonly authorization_server: Schema.String;
      readonly authorization_endpoint: Schema.String;
      readonly token_endpoint: Schema.String;
      readonly registration_endpoint: Schema.optional<Schema.String>;
      readonly scopes_supported: Schema.$Array<Schema.String>;
      readonly has_dynamic_registration: Schema.Boolean;
      readonly service_documentation: Schema.optional<Schema.String>;
      readonly op_policy_uri: Schema.optional<Schema.String>;
      readonly op_tos_uri: Schema.optional<Schema.String>;
      readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
      readonly resource: Schema.optional<Schema.String>;
      readonly resource_documentation: Schema.optional<Schema.String>;
      readonly revocation_endpoint: Schema.optional<Schema.String>;
    }>>;
    readonly mcp_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
    readonly composio_static_auth: Schema.optional<Schema.Struct<{
      readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
      readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
      readonly validate_credentials: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly cli_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly runnable: Schema.Struct<{
      readonly summary: Schema.NonEmptyString;
      readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
    }>;
    readonly verify_probe: Schema.Struct<{
      readonly args: Schema.$Array<Schema.NonEmptyString>;
      readonly success_message: Schema.NonEmptyString;
    }>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
  }>;
  readonly config: Schema.Struct<{
    readonly cli_launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly cli_command: Schema.NonEmptyString;
    readonly cli_args: Schema.optional<Schema.$Array<Schema.String>>;
    readonly cli_cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
    readonly cli_cwd: Schema.optional<Schema.String>;
    readonly cli_allowed_env_keys: Schema.optional<Schema.$Array<Schema.String>>;
    readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
      readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
      readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
      readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
    }>>;
    readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly secret_name: Schema.NonEmptyString;
      readonly env: Schema.NonEmptyString;
      readonly required: Schema.optional<Schema.Boolean>;
    }>>>;
    readonly sand_runtime: Schema.optional<Schema.Struct<{
      readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_dir">;
        readonly prefix: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_file">;
        readonly filename: Schema.NonEmptyString;
        readonly prefix: Schema.optional<Schema.NonEmptyString>;
        readonly parent_artifact_id: Schema.optional<Schema.String>;
        readonly contents: Schema.optional<Schema.String>;
      }>]>>>;
      readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly value: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>;
      }>>>;
      readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>>>;
    }>>;
    readonly cli_result_defaults: Schema.optional<Schema.Struct<{
      readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
      readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly streaming: Schema.optional<Schema.Boolean>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>>;
    readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
      readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
      readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
      readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly manifest: Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly api_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly base_url: Schema.NonEmptyString;
    readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"request">;
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly path: Schema.NonEmptyString;
      readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"graphql">;
      readonly method: Schema.Literal<"POST">;
      readonly path: Schema.NonEmptyString;
      readonly document: Schema.NonEmptyString;
      readonly operation_name: Schema.optional<Schema.NonEmptyString>;
      readonly variables_template: Schema.optional<Schema.Unknown>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>]>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
    readonly spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>;
  readonly config: Schema.Struct<{
    readonly api_protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
    readonly api_base_url: Schema.NonEmptyString;
    readonly api_allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    readonly api_spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly api_timeout_ms: Schema.optional<Schema.Number>;
    readonly api_auth: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
      readonly required: Schema.optional<Schema.Boolean>;
      readonly env: Schema.optional<Schema.String>;
      readonly secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly header_name: Schema.optional<Schema.String>;
      readonly query_param: Schema.optional<Schema.String>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly username_env: Schema.optional<Schema.String>;
      readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly password_env: Schema.optional<Schema.String>;
      readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
    }>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"composio">;
  readonly config: Schema.Struct<{
    readonly composio_auth_config_id: Schema.NonEmptyString;
    readonly toolkit_slug: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.NonEmptyString>;
    readonly allowed_tools: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>]>;
type PluginRegistryEntry = typeof PluginRegistryEntry.Type;
declare const PluginRegistryEntryAvailability: Schema.Struct<{
  readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
  readonly selectable: Schema.Boolean;
  readonly hiddenInOnboarding: Schema.Boolean;
  readonly label: Schema.optional<Schema.String>;
  readonly reason: Schema.optional<Schema.String>;
  readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
}>;
type PluginRegistryEntryAvailability = typeof PluginRegistryEntryAvailability.Type;
type RegistryAvailability = PluginRegistryEntryAvailability;
type RegistryAvailabilityStatus = RegistryAvailability['status'];
type RegistryAvailabilityReason = NonNullable<RegistryAvailability['code']>;
declare const PluginRegistryPublicEntry: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly config: Schema.Struct<{
    readonly mcp_endpoint: Schema.NonEmptyString;
    readonly mcp_transport: Schema.Literals<readonly ["http", "sse"]>;
    readonly oauth_discovery: Schema.optional<Schema.Struct<{
      readonly authorization_server: Schema.String;
      readonly authorization_endpoint: Schema.String;
      readonly token_endpoint: Schema.String;
      readonly registration_endpoint: Schema.optional<Schema.String>;
      readonly scopes_supported: Schema.$Array<Schema.String>;
      readonly has_dynamic_registration: Schema.Boolean;
      readonly service_documentation: Schema.optional<Schema.String>;
      readonly op_policy_uri: Schema.optional<Schema.String>;
      readonly op_tos_uri: Schema.optional<Schema.String>;
      readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
      readonly resource: Schema.optional<Schema.String>;
      readonly resource_documentation: Schema.optional<Schema.String>;
      readonly revocation_endpoint: Schema.optional<Schema.String>;
    }>>;
    readonly mcp_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
    readonly composio_static_auth: Schema.optional<Schema.Struct<{
      readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
      readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
      readonly validate_credentials: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly cli_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly runnable: Schema.Struct<{
      readonly summary: Schema.NonEmptyString;
      readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
    }>;
    readonly verify_probe: Schema.Struct<{
      readonly args: Schema.$Array<Schema.NonEmptyString>;
      readonly success_message: Schema.NonEmptyString;
    }>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
  }>;
  readonly config: Schema.Struct<{
    readonly cli_launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly cli_command: Schema.NonEmptyString;
    readonly cli_args: Schema.optional<Schema.$Array<Schema.String>>;
    readonly cli_cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
    readonly cli_cwd: Schema.optional<Schema.String>;
    readonly cli_allowed_env_keys: Schema.optional<Schema.$Array<Schema.String>>;
    readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
      readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
      readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
      readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
    }>>;
    readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly secret_name: Schema.NonEmptyString;
      readonly env: Schema.NonEmptyString;
      readonly required: Schema.optional<Schema.Boolean>;
    }>>>;
    readonly sand_runtime: Schema.optional<Schema.Struct<{
      readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_dir">;
        readonly prefix: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_file">;
        readonly filename: Schema.NonEmptyString;
        readonly prefix: Schema.optional<Schema.NonEmptyString>;
        readonly parent_artifact_id: Schema.optional<Schema.String>;
        readonly contents: Schema.optional<Schema.String>;
      }>]>>>;
      readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly value: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>;
      }>>>;
      readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>>>;
    }>>;
    readonly cli_result_defaults: Schema.optional<Schema.Struct<{
      readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
      readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly streaming: Schema.optional<Schema.Boolean>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>>;
    readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
      readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
      readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
      readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly manifest: Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly api_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly base_url: Schema.NonEmptyString;
    readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"request">;
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly path: Schema.NonEmptyString;
      readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"graphql">;
      readonly method: Schema.Literal<"POST">;
      readonly path: Schema.NonEmptyString;
      readonly document: Schema.NonEmptyString;
      readonly operation_name: Schema.optional<Schema.NonEmptyString>;
      readonly variables_template: Schema.optional<Schema.Unknown>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>]>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
    readonly spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>;
  readonly config: Schema.Struct<{
    readonly api_protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
    readonly api_base_url: Schema.NonEmptyString;
    readonly api_allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    readonly api_spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly api_timeout_ms: Schema.optional<Schema.Number>;
    readonly api_auth: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
      readonly required: Schema.optional<Schema.Boolean>;
      readonly env: Schema.optional<Schema.String>;
      readonly secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly header_name: Schema.optional<Schema.String>;
      readonly query_param: Schema.optional<Schema.String>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly username_env: Schema.optional<Schema.String>;
      readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly password_env: Schema.optional<Schema.String>;
      readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
    }>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"composio">;
  readonly config: Schema.Struct<{
    readonly composio_auth_config_id: Schema.NonEmptyString;
    readonly toolkit_slug: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.NonEmptyString>;
    readonly allowed_tools: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  }>;
  readonly manifest: Schema.optional<Schema.Struct<{
    readonly tools: Schema.$Array<Schema.Struct<{
      readonly tool_id: Schema.String;
      readonly name: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.optional<Schema.String>;
      readonly title: Schema.optional<Schema.String>;
      readonly input_schema: Schema.optional<Schema.Unknown>;
      readonly output_schema: Schema.optional<Schema.Unknown>;
      readonly annotations: Schema.optional<Schema.Unknown>;
      readonly icons: Schema.optional<Schema.Unknown>;
      readonly binding: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"mcp">;
        readonly tool_name: Schema.String;
        readonly cached_input_schema: Schema.optional<Schema.Unknown>;
        readonly cached_output_schema: Schema.optional<Schema.Unknown>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"cli_command">;
        readonly tool_name: Schema.String;
        readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"input">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"option">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
          readonly omit_if_empty: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"flag">;
          readonly flag: Schema.NonEmptyString;
          readonly path: Schema.NonEmptyString;
        }>]>>;
        readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly streaming: Schema.optional<Schema.Boolean>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly body_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"api_graphql">;
        readonly path: Schema.optional<Schema.NonEmptyString>;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
        readonly auth: Schema.optional<Schema.Struct<{
          readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
          readonly required: Schema.optional<Schema.Boolean>;
          readonly env: Schema.optional<Schema.String>;
          readonly secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly header_name: Schema.optional<Schema.String>;
          readonly query_param: Schema.optional<Schema.String>;
          readonly prefix: Schema.optional<Schema.String>;
          readonly username_env: Schema.optional<Schema.String>;
          readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
          readonly password_env: Schema.optional<Schema.String>;
          readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
        }>>;
      }>]>;
      readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
  }>>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>]>;
type PluginRegistryPublicEntry = typeof PluginRegistryPublicEntry.Type;
declare const PluginRegistryListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"mcp">;
    readonly config: Schema.Struct<{
      readonly mcp_endpoint: Schema.NonEmptyString;
      readonly mcp_transport: Schema.Literals<readonly ["http", "sse"]>;
      readonly oauth_discovery: Schema.optional<Schema.Struct<{
        readonly authorization_server: Schema.String;
        readonly authorization_endpoint: Schema.String;
        readonly token_endpoint: Schema.String;
        readonly registration_endpoint: Schema.optional<Schema.String>;
        readonly scopes_supported: Schema.$Array<Schema.String>;
        readonly has_dynamic_registration: Schema.Boolean;
        readonly service_documentation: Schema.optional<Schema.String>;
        readonly op_policy_uri: Schema.optional<Schema.String>;
        readonly op_tos_uri: Schema.optional<Schema.String>;
        readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
        readonly resource: Schema.optional<Schema.String>;
        readonly resource_documentation: Schema.optional<Schema.String>;
        readonly revocation_endpoint: Schema.optional<Schema.String>;
      }>>;
      readonly mcp_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
      readonly composio_static_auth: Schema.optional<Schema.Struct<{
        readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
        readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
        readonly validate_credentials: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly manifest: Schema.optional<Schema.Struct<{
      readonly tools: Schema.$Array<Schema.Struct<{
        readonly tool_id: Schema.String;
        readonly name: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.optional<Schema.String>;
        readonly title: Schema.optional<Schema.String>;
        readonly input_schema: Schema.optional<Schema.Unknown>;
        readonly output_schema: Schema.optional<Schema.Unknown>;
        readonly annotations: Schema.optional<Schema.Unknown>;
        readonly icons: Schema.optional<Schema.Unknown>;
        readonly binding: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"mcp">;
          readonly tool_name: Schema.String;
          readonly cached_input_schema: Schema.optional<Schema.Unknown>;
          readonly cached_output_schema: Schema.optional<Schema.Unknown>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"cli_command">;
          readonly tool_name: Schema.String;
          readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"input">;
            readonly path: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"option">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
            readonly omit_if_empty: Schema.optional<Schema.Boolean>;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"flag">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
          }>]>>;
          readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
          readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly streaming: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_request">;
          readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
          readonly path: Schema.NonEmptyString;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly body_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_graphql">;
          readonly path: Schema.optional<Schema.NonEmptyString>;
          readonly document: Schema.NonEmptyString;
          readonly operation_name: Schema.optional<Schema.NonEmptyString>;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly variables_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>]>;
        readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      }>>;
      readonly shared_defs: Schema.optional<Schema.Unknown>;
    }>>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"cli">;
    readonly cli_setup: Schema.Struct<{
      readonly links: Schema.$Array<Schema.Struct<{
        readonly label: Schema.String;
        readonly url: Schema.String;
        readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
      }>>;
      readonly required_secrets: Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.NonEmptyString;
        readonly required: Schema.Boolean;
      }>>;
      readonly runnable: Schema.Struct<{
        readonly summary: Schema.NonEmptyString;
        readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
      }>;
      readonly verify_probe: Schema.Struct<{
        readonly args: Schema.$Array<Schema.NonEmptyString>;
        readonly success_message: Schema.NonEmptyString;
      }>;
      readonly failure_hints: Schema.$Array<Schema.Struct<{
        readonly matchers: Schema.$Array<Schema.Struct<{
          readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
          readonly pattern: Schema.NonEmptyString;
          readonly flags: Schema.optional<Schema.NonEmptyString>;
        }>>;
        readonly message: Schema.NonEmptyString;
      }>>;
    }>;
    readonly config: Schema.Struct<{
      readonly cli_launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
      readonly cli_command: Schema.NonEmptyString;
      readonly cli_args: Schema.optional<Schema.$Array<Schema.String>>;
      readonly cli_cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
      readonly cli_cwd: Schema.optional<Schema.String>;
      readonly cli_allowed_env_keys: Schema.optional<Schema.$Array<Schema.String>>;
      readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
        readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
        readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
        readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
      }>>;
      readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly secret_name: Schema.NonEmptyString;
        readonly env: Schema.NonEmptyString;
        readonly required: Schema.optional<Schema.Boolean>;
      }>>>;
      readonly sand_runtime: Schema.optional<Schema.Struct<{
        readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_dir">;
          readonly prefix: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_file">;
          readonly filename: Schema.NonEmptyString;
          readonly prefix: Schema.optional<Schema.NonEmptyString>;
          readonly parent_artifact_id: Schema.optional<Schema.String>;
          readonly contents: Schema.optional<Schema.String>;
        }>]>>>;
        readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
          readonly env: Schema.String;
          readonly value: Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"artifact_path">;
            readonly artifact_id: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"secret_env">;
            readonly env: Schema.String;
          }>]>;
        }>>>;
        readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>>>;
      }>>;
      readonly cli_result_defaults: Schema.optional<Schema.Struct<{
        readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly streaming: Schema.optional<Schema.Boolean>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
      }>>;
      readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
        readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
        readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
        readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly manifest: Schema.Struct<{
      readonly tools: Schema.$Array<Schema.Struct<{
        readonly tool_id: Schema.String;
        readonly name: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.optional<Schema.String>;
        readonly title: Schema.optional<Schema.String>;
        readonly input_schema: Schema.optional<Schema.Unknown>;
        readonly output_schema: Schema.optional<Schema.Unknown>;
        readonly annotations: Schema.optional<Schema.Unknown>;
        readonly icons: Schema.optional<Schema.Unknown>;
        readonly binding: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"mcp">;
          readonly tool_name: Schema.String;
          readonly cached_input_schema: Schema.optional<Schema.Unknown>;
          readonly cached_output_schema: Schema.optional<Schema.Unknown>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"cli_command">;
          readonly tool_name: Schema.String;
          readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"input">;
            readonly path: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"option">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
            readonly omit_if_empty: Schema.optional<Schema.Boolean>;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"flag">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
          }>]>>;
          readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
          readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly streaming: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_request">;
          readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
          readonly path: Schema.NonEmptyString;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly body_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_graphql">;
          readonly path: Schema.optional<Schema.NonEmptyString>;
          readonly document: Schema.NonEmptyString;
          readonly operation_name: Schema.optional<Schema.NonEmptyString>;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly variables_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>]>;
        readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      }>>;
      readonly shared_defs: Schema.optional<Schema.Unknown>;
    }>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api">;
    readonly api_setup: Schema.Struct<{
      readonly links: Schema.$Array<Schema.Struct<{
        readonly label: Schema.String;
        readonly url: Schema.String;
        readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
      }>>;
      readonly base_url: Schema.NonEmptyString;
      readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly required_secrets: Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.NonEmptyString;
        readonly required: Schema.Boolean;
      }>>;
      readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly expected_status: Schema.optional<Schema.Number>;
        readonly success_message: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"graphql">;
        readonly method: Schema.Literal<"POST">;
        readonly path: Schema.NonEmptyString;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly expected_status: Schema.optional<Schema.Number>;
        readonly success_message: Schema.NonEmptyString;
      }>]>;
      readonly failure_hints: Schema.$Array<Schema.Struct<{
        readonly matchers: Schema.$Array<Schema.Struct<{
          readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
          readonly pattern: Schema.NonEmptyString;
          readonly flags: Schema.optional<Schema.NonEmptyString>;
        }>>;
        readonly message: Schema.NonEmptyString;
      }>>;
      readonly spec_url: Schema.optional<Schema.NonEmptyString>;
      readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
      readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
      readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>;
    readonly config: Schema.Struct<{
      readonly api_protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
      readonly api_base_url: Schema.NonEmptyString;
      readonly api_allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      readonly api_spec_url: Schema.optional<Schema.NonEmptyString>;
      readonly api_graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
      readonly api_graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
      readonly api_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly api_timeout_ms: Schema.optional<Schema.Number>;
      readonly api_auth: Schema.optional<Schema.Struct<{
        readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
        readonly required: Schema.optional<Schema.Boolean>;
        readonly env: Schema.optional<Schema.String>;
        readonly secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly header_name: Schema.optional<Schema.String>;
        readonly query_param: Schema.optional<Schema.String>;
        readonly prefix: Schema.optional<Schema.String>;
        readonly username_env: Schema.optional<Schema.String>;
        readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly password_env: Schema.optional<Schema.String>;
        readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
      }>>;
    }>;
    readonly manifest: Schema.optional<Schema.Struct<{
      readonly tools: Schema.$Array<Schema.Struct<{
        readonly tool_id: Schema.String;
        readonly name: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.optional<Schema.String>;
        readonly title: Schema.optional<Schema.String>;
        readonly input_schema: Schema.optional<Schema.Unknown>;
        readonly output_schema: Schema.optional<Schema.Unknown>;
        readonly annotations: Schema.optional<Schema.Unknown>;
        readonly icons: Schema.optional<Schema.Unknown>;
        readonly binding: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"mcp">;
          readonly tool_name: Schema.String;
          readonly cached_input_schema: Schema.optional<Schema.Unknown>;
          readonly cached_output_schema: Schema.optional<Schema.Unknown>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"cli_command">;
          readonly tool_name: Schema.String;
          readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"input">;
            readonly path: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"option">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
            readonly omit_if_empty: Schema.optional<Schema.Boolean>;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"flag">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
          }>]>>;
          readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
          readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly streaming: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_request">;
          readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
          readonly path: Schema.NonEmptyString;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly body_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_graphql">;
          readonly path: Schema.optional<Schema.NonEmptyString>;
          readonly document: Schema.NonEmptyString;
          readonly operation_name: Schema.optional<Schema.NonEmptyString>;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly variables_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>]>;
        readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      }>>;
      readonly shared_defs: Schema.optional<Schema.Unknown>;
    }>>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"composio">;
    readonly config: Schema.Struct<{
      readonly composio_auth_config_id: Schema.NonEmptyString;
      readonly toolkit_slug: Schema.NonEmptyString;
      readonly version: Schema.optional<Schema.NonEmptyString>;
      readonly allowed_tools: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>;
    readonly manifest: Schema.optional<Schema.Struct<{
      readonly tools: Schema.$Array<Schema.Struct<{
        readonly tool_id: Schema.String;
        readonly name: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.optional<Schema.String>;
        readonly title: Schema.optional<Schema.String>;
        readonly input_schema: Schema.optional<Schema.Unknown>;
        readonly output_schema: Schema.optional<Schema.Unknown>;
        readonly annotations: Schema.optional<Schema.Unknown>;
        readonly icons: Schema.optional<Schema.Unknown>;
        readonly binding: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"mcp">;
          readonly tool_name: Schema.String;
          readonly cached_input_schema: Schema.optional<Schema.Unknown>;
          readonly cached_output_schema: Schema.optional<Schema.Unknown>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"cli_command">;
          readonly tool_name: Schema.String;
          readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"input">;
            readonly path: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"option">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
            readonly omit_if_empty: Schema.optional<Schema.Boolean>;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"flag">;
            readonly flag: Schema.NonEmptyString;
            readonly path: Schema.NonEmptyString;
          }>]>>;
          readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
          readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly streaming: Schema.optional<Schema.Boolean>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_request">;
          readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
          readonly path: Schema.NonEmptyString;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly body_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"api_graphql">;
          readonly path: Schema.optional<Schema.NonEmptyString>;
          readonly document: Schema.NonEmptyString;
          readonly operation_name: Schema.optional<Schema.NonEmptyString>;
          readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
          readonly variables_template: Schema.optional<Schema.Unknown>;
          readonly timeout_ms: Schema.optional<Schema.Number>;
          readonly auth: Schema.optional<Schema.Struct<{
            readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
            readonly required: Schema.optional<Schema.Boolean>;
            readonly env: Schema.optional<Schema.String>;
            readonly secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly header_name: Schema.optional<Schema.String>;
            readonly query_param: Schema.optional<Schema.String>;
            readonly prefix: Schema.optional<Schema.String>;
            readonly username_env: Schema.optional<Schema.String>;
            readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
            readonly password_env: Schema.optional<Schema.String>;
            readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
          }>>;
        }>]>;
        readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      }>>;
      readonly shared_defs: Schema.optional<Schema.Unknown>;
    }>>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>]>>;
  readonly total: Schema.Number;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
}>;
type PluginRegistryListResult = typeof PluginRegistryListResult.Type;
declare const PluginRegistryPublicEntryWithoutManifest: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly config: Schema.Struct<{
    readonly mcp_endpoint: Schema.NonEmptyString;
    readonly mcp_transport: Schema.Literals<readonly ["http", "sse"]>;
    readonly oauth_discovery: Schema.optional<Schema.Struct<{
      readonly authorization_server: Schema.String;
      readonly authorization_endpoint: Schema.String;
      readonly token_endpoint: Schema.String;
      readonly registration_endpoint: Schema.optional<Schema.String>;
      readonly scopes_supported: Schema.$Array<Schema.String>;
      readonly has_dynamic_registration: Schema.Boolean;
      readonly service_documentation: Schema.optional<Schema.String>;
      readonly op_policy_uri: Schema.optional<Schema.String>;
      readonly op_tos_uri: Schema.optional<Schema.String>;
      readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
      readonly resource: Schema.optional<Schema.String>;
      readonly resource_documentation: Schema.optional<Schema.String>;
      readonly revocation_endpoint: Schema.optional<Schema.String>;
    }>>;
    readonly mcp_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
    readonly composio_static_auth: Schema.optional<Schema.Struct<{
      readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
      readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
      readonly validate_credentials: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly cli_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly runnable: Schema.Struct<{
      readonly summary: Schema.NonEmptyString;
      readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
    }>;
    readonly verify_probe: Schema.Struct<{
      readonly args: Schema.$Array<Schema.NonEmptyString>;
      readonly success_message: Schema.NonEmptyString;
    }>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
  }>;
  readonly config: Schema.Struct<{
    readonly cli_launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly cli_command: Schema.NonEmptyString;
    readonly cli_args: Schema.optional<Schema.$Array<Schema.String>>;
    readonly cli_cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
    readonly cli_cwd: Schema.optional<Schema.String>;
    readonly cli_allowed_env_keys: Schema.optional<Schema.$Array<Schema.String>>;
    readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
      readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
      readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
      readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
    }>>;
    readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly secret_name: Schema.NonEmptyString;
      readonly env: Schema.NonEmptyString;
      readonly required: Schema.optional<Schema.Boolean>;
    }>>>;
    readonly sand_runtime: Schema.optional<Schema.Struct<{
      readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_dir">;
        readonly prefix: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_file">;
        readonly filename: Schema.NonEmptyString;
        readonly prefix: Schema.optional<Schema.NonEmptyString>;
        readonly parent_artifact_id: Schema.optional<Schema.String>;
        readonly contents: Schema.optional<Schema.String>;
      }>]>>>;
      readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly value: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>;
      }>>>;
      readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>>>;
    }>>;
    readonly cli_result_defaults: Schema.optional<Schema.Struct<{
      readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
      readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly streaming: Schema.optional<Schema.Boolean>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>>;
    readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
      readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
      readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
      readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly api_setup: Schema.Struct<{
    readonly links: Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>;
    readonly base_url: Schema.NonEmptyString;
    readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly required_secrets: Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly display_name: Schema.NonEmptyString;
      readonly description: Schema.NonEmptyString;
      readonly required: Schema.Boolean;
    }>>;
    readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"request">;
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly path: Schema.NonEmptyString;
      readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"graphql">;
      readonly method: Schema.Literal<"POST">;
      readonly path: Schema.NonEmptyString;
      readonly document: Schema.NonEmptyString;
      readonly operation_name: Schema.optional<Schema.NonEmptyString>;
      readonly variables_template: Schema.optional<Schema.Unknown>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly success_message: Schema.NonEmptyString;
    }>]>;
    readonly failure_hints: Schema.$Array<Schema.Struct<{
      readonly matchers: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
        readonly pattern: Schema.NonEmptyString;
        readonly flags: Schema.optional<Schema.NonEmptyString>;
      }>>;
      readonly message: Schema.NonEmptyString;
    }>>;
    readonly spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>;
  readonly config: Schema.Struct<{
    readonly api_protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
    readonly api_base_url: Schema.NonEmptyString;
    readonly api_allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    readonly api_spec_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
    readonly api_graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
    readonly api_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly api_timeout_ms: Schema.optional<Schema.Number>;
    readonly api_auth: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
      readonly required: Schema.optional<Schema.Boolean>;
      readonly env: Schema.optional<Schema.String>;
      readonly secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly header_name: Schema.optional<Schema.String>;
      readonly query_param: Schema.optional<Schema.String>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly username_env: Schema.optional<Schema.String>;
      readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
      readonly password_env: Schema.optional<Schema.String>;
      readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
    }>>;
  }>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"composio">;
  readonly config: Schema.Struct<{
    readonly composio_auth_config_id: Schema.NonEmptyString;
    readonly toolkit_slug: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.NonEmptyString>;
    readonly allowed_tools: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  }>;
  readonly availability: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hiddenInOnboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  }>;
  readonly slug: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.NonEmptyString;
  readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
  readonly auth: Schema.Struct<{
    readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
    readonly header_name: Schema.optional<Schema.NonEmptyString>;
    readonly query_param: Schema.optional<Schema.NonEmptyString>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly required_secrets: Schema.$Array<Schema.String>;
  }>;
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  readonly oauth_client: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.NonEmptyString>;
    readonly client_secret: Schema.optional<Schema.NonEmptyString>;
    readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
    readonly scope: Schema.optional<Schema.NonEmptyString>;
  }>>;
  readonly auth_test: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
    readonly url: Schema.optional<Schema.NonEmptyString>;
    readonly path: Schema.optional<Schema.NonEmptyString>;
    readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
    readonly body: Schema.optional<Schema.Unknown>;
    readonly expected_status: Schema.optional<Schema.Number>;
    readonly auth_template: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"header">;
      readonly header_name: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"query">;
      readonly query_param: Schema.NonEmptyString;
      readonly value_template: Schema.NonEmptyString;
      readonly secret_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"basic">;
      readonly username_slot: Schema.NonEmptyString;
      readonly password_slot: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"oauth_grant">;
      readonly header_name: Schema.optional<Schema.String>;
      readonly value_template: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"none">;
    }>]>;
  }>>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly icon_url: Schema.optional<Schema.NonEmptyString>;
  readonly skill: Schema.optional<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
  }>>;
  readonly default_namespace: Schema.String;
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  readonly popularity: Schema.optional<Schema.Number>;
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>]>;
type PluginRegistryPublicEntryWithoutManifest = typeof PluginRegistryPublicEntryWithoutManifest.Type;
declare const PluginRegistryListResultWithoutManifest: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"mcp">;
    readonly config: Schema.Struct<{
      readonly mcp_endpoint: Schema.NonEmptyString;
      readonly mcp_transport: Schema.Literals<readonly ["http", "sse"]>;
      readonly oauth_discovery: Schema.optional<Schema.Struct<{
        readonly authorization_server: Schema.String;
        readonly authorization_endpoint: Schema.String;
        readonly token_endpoint: Schema.String;
        readonly registration_endpoint: Schema.optional<Schema.String>;
        readonly scopes_supported: Schema.$Array<Schema.String>;
        readonly has_dynamic_registration: Schema.Boolean;
        readonly service_documentation: Schema.optional<Schema.String>;
        readonly op_policy_uri: Schema.optional<Schema.String>;
        readonly op_tos_uri: Schema.optional<Schema.String>;
        readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
        readonly resource: Schema.optional<Schema.String>;
        readonly resource_documentation: Schema.optional<Schema.String>;
        readonly revocation_endpoint: Schema.optional<Schema.String>;
      }>>;
      readonly mcp_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
      readonly composio_static_auth: Schema.optional<Schema.Struct<{
        readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
        readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
        readonly validate_credentials: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"cli">;
    readonly cli_setup: Schema.Struct<{
      readonly links: Schema.$Array<Schema.Struct<{
        readonly label: Schema.String;
        readonly url: Schema.String;
        readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
      }>>;
      readonly required_secrets: Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.NonEmptyString;
        readonly required: Schema.Boolean;
      }>>;
      readonly runnable: Schema.Struct<{
        readonly summary: Schema.NonEmptyString;
        readonly required_programs: Schema.$Array<Schema.NonEmptyString>;
      }>;
      readonly verify_probe: Schema.Struct<{
        readonly args: Schema.$Array<Schema.NonEmptyString>;
        readonly success_message: Schema.NonEmptyString;
      }>;
      readonly failure_hints: Schema.$Array<Schema.Struct<{
        readonly matchers: Schema.$Array<Schema.Struct<{
          readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
          readonly pattern: Schema.NonEmptyString;
          readonly flags: Schema.optional<Schema.NonEmptyString>;
        }>>;
        readonly message: Schema.NonEmptyString;
      }>>;
    }>;
    readonly config: Schema.Struct<{
      readonly cli_launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
      readonly cli_command: Schema.NonEmptyString;
      readonly cli_args: Schema.optional<Schema.$Array<Schema.String>>;
      readonly cli_cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
      readonly cli_cwd: Schema.optional<Schema.String>;
      readonly cli_allowed_env_keys: Schema.optional<Schema.$Array<Schema.String>>;
      readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
        readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
        readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
        readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
      }>>;
      readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly secret_name: Schema.NonEmptyString;
        readonly env: Schema.NonEmptyString;
        readonly required: Schema.optional<Schema.Boolean>;
      }>>>;
      readonly sand_runtime: Schema.optional<Schema.Struct<{
        readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_dir">;
          readonly prefix: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_file">;
          readonly filename: Schema.NonEmptyString;
          readonly prefix: Schema.optional<Schema.NonEmptyString>;
          readonly parent_artifact_id: Schema.optional<Schema.String>;
          readonly contents: Schema.optional<Schema.String>;
        }>]>>>;
        readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
          readonly env: Schema.String;
          readonly value: Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"artifact_path">;
            readonly artifact_id: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"secret_env">;
            readonly env: Schema.String;
          }>]>;
        }>>>;
        readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>>>;
      }>>;
      readonly cli_result_defaults: Schema.optional<Schema.Struct<{
        readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
        readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
        readonly streaming: Schema.optional<Schema.Boolean>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
      }>>;
      readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
        readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
        readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
        readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api">;
    readonly api_setup: Schema.Struct<{
      readonly links: Schema.$Array<Schema.Struct<{
        readonly label: Schema.String;
        readonly url: Schema.String;
        readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
      }>>;
      readonly base_url: Schema.NonEmptyString;
      readonly auth_mode: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly required_secrets: Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly display_name: Schema.NonEmptyString;
        readonly description: Schema.NonEmptyString;
        readonly required: Schema.Boolean;
      }>>;
      readonly verify_probe: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"request">;
        readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
        readonly path: Schema.NonEmptyString;
        readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly expected_status: Schema.optional<Schema.Number>;
        readonly success_message: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"graphql">;
        readonly method: Schema.Literal<"POST">;
        readonly path: Schema.NonEmptyString;
        readonly document: Schema.NonEmptyString;
        readonly operation_name: Schema.optional<Schema.NonEmptyString>;
        readonly variables_template: Schema.optional<Schema.Unknown>;
        readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
        readonly expected_status: Schema.optional<Schema.Number>;
        readonly success_message: Schema.NonEmptyString;
      }>]>;
      readonly failure_hints: Schema.$Array<Schema.Struct<{
        readonly matchers: Schema.$Array<Schema.Struct<{
          readonly kind: Schema.Literals<readonly ["substring", "regex"]>;
          readonly pattern: Schema.NonEmptyString;
          readonly flags: Schema.optional<Schema.NonEmptyString>;
        }>>;
        readonly message: Schema.NonEmptyString;
      }>>;
      readonly spec_url: Schema.optional<Schema.NonEmptyString>;
      readonly graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
      readonly graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
      readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>;
    readonly config: Schema.Struct<{
      readonly api_protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
      readonly api_base_url: Schema.NonEmptyString;
      readonly api_allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
      readonly api_spec_url: Schema.optional<Schema.NonEmptyString>;
      readonly api_graphql_endpoint: Schema.optional<Schema.NonEmptyString>;
      readonly api_graphql_schema_url: Schema.optional<Schema.NonEmptyString>;
      readonly api_default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly api_timeout_ms: Schema.optional<Schema.Number>;
      readonly api_auth: Schema.optional<Schema.Struct<{
        readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
        readonly required: Schema.optional<Schema.Boolean>;
        readonly env: Schema.optional<Schema.String>;
        readonly secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly header_name: Schema.optional<Schema.String>;
        readonly query_param: Schema.optional<Schema.String>;
        readonly prefix: Schema.optional<Schema.String>;
        readonly username_env: Schema.optional<Schema.String>;
        readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
        readonly password_env: Schema.optional<Schema.String>;
        readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
      }>>;
    }>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"composio">;
    readonly config: Schema.Struct<{
      readonly composio_auth_config_id: Schema.NonEmptyString;
      readonly toolkit_slug: Schema.NonEmptyString;
      readonly version: Schema.optional<Schema.NonEmptyString>;
      readonly allowed_tools: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    }>;
    readonly availability: Schema.Struct<{
      readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
      readonly selectable: Schema.Boolean;
      readonly hiddenInOnboarding: Schema.Boolean;
      readonly label: Schema.optional<Schema.String>;
      readonly reason: Schema.optional<Schema.String>;
      readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    }>;
    readonly slug: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.NonEmptyString;
    readonly category: Schema.Literals<readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"]>;
    readonly auth: Schema.Struct<{
      readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none", "basic"]>;
      readonly header_name: Schema.optional<Schema.NonEmptyString>;
      readonly query_param: Schema.optional<Schema.NonEmptyString>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly required_secrets: Schema.$Array<Schema.String>;
    }>;
    /**
     * Pre-registered OAuth client seed (for providers that don't support
     * RFC 7591 dynamic registration but expose a public proxy client).
     * PostHog's remote MCP, for example, ships with a fixed public client_id
     * and a hardcoded redirect_uri.
     */
    readonly oauth_client: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.NonEmptyString>;
      readonly client_secret: Schema.optional<Schema.NonEmptyString>;
      readonly redirect_uri: Schema.optional<Schema.NonEmptyString>;
      readonly scope: Schema.optional<Schema.NonEmptyString>;
    }>>;
    readonly auth_test: Schema.optional<Schema.Struct<{
      readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
      readonly url: Schema.optional<Schema.NonEmptyString>;
      readonly path: Schema.optional<Schema.NonEmptyString>;
      readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
      readonly body: Schema.optional<Schema.Unknown>;
      readonly expected_status: Schema.optional<Schema.Number>;
      readonly auth_template: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"header">;
        readonly header_name: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"query">;
        readonly query_param: Schema.NonEmptyString;
        readonly value_template: Schema.NonEmptyString;
        readonly secret_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"basic">;
        readonly username_slot: Schema.NonEmptyString;
        readonly password_slot: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"oauth_grant">;
        readonly header_name: Schema.optional<Schema.String>;
        readonly value_template: Schema.optional<Schema.String>;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"none">;
      }>]>;
    }>>;
    readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>;
    readonly icon_url: Schema.optional<Schema.NonEmptyString>;
    readonly skill: Schema.optional<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
    }>>;
    readonly default_namespace: Schema.String;
    /**
     * Hand-tuned popularity score used to rank the catalog in the dashboard.
     * Higher = more likely to be surfaced first. Values typically fall on a
     * 0..100 scale. Decorated by `listRegistryEntries()` from a central
     * POPULARITY map so the canonical catalog JSON stays free of churn.
     *
     * Will eventually be replaced / supplemented by a workspace-scoped
     * usage-metric popularity (live telemetry), but this hard-coded seed is
     * what the UI reads today.
     */
    readonly popularity: Schema.optional<Schema.Number>;
    /**
     * Server-decorated: true when Harbor has a global OAuth client
     * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
     * slug is eligible for global-client activation. SourcePolicy uses this
     * deploy fact to flip eligible confidential-client providers from
     * `coming_soon` to `active` without exposing the secret itself. The
     * client never sets this field — it is attached by `plugins/registry/list`
     * on the API.
     */
    readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
  }>]>>;
  readonly total: Schema.Number;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
}>;
type PluginRegistryListResultWithoutManifest = typeof PluginRegistryListResultWithoutManifest.Type;
//#endregion
//#region ../registry/src/local-icon-style.d.ts
type LocalIconStyle = 'color' | 'mono';
interface LocalIconSingle {
  readonly kind: 'single';
  readonly path: string;
  readonly style: LocalIconStyle;
}
interface LocalIconThemed {
  readonly kind: 'themed';
  readonly light: string;
  readonly dark: string;
}
type LocalIcon = LocalIconSingle | LocalIconThemed;
//#endregion
//#region ../registry/src/entries.d.ts
declare const PLUGIN_REGISTRY: PluginRegistryEntry[];
//#endregion
//#region ../registry/src/local-icons.d.ts
declare const LOCAL_ICONS: Record<string, LocalIcon>;
declare const LOCAL_ICON_PATHS: Record<string, string>;
//#endregion
//#region ../registry/src/index.d.ts
declare function getLocalIcon(slug: string): LocalIcon | undefined;
declare function getLocalIconPath(slug: string, theme?: 'light' | 'dark'): string | undefined;
declare function getLocalIconStyle(slug: string): LocalIconStyle | 'themed' | undefined;
declare function isLocalIconUrl(url?: string | null): url is string;
declare const ICON_HOST_OVERRIDES: Partial<Record<string, string>>;
declare function faviconUrl(host: string): string;
declare function tryHost(value?: string): string | undefined;
declare const POPULARITY_DEFAULT: number;
declare const POPULARITY: Partial<Record<string, number>>;
declare function getRegistryEntry(slug: string): PluginRegistryEntry | undefined;
declare function listRegistryEntries(category?: PluginCategory): PluginRegistryEntry[];
declare function getRequiredSecrets(slug: string): string[];
declare function countCallableManifestTools(tools: ReadonlyArray<PluginRegistryManifestTool>): number;
declare function getRequiredSecretEnvs(entry: PluginRegistryEntry): ReadonlyArray<string>;
declare function getAllowedSecretEnvs(entry: PluginRegistryEntry): ReadonlyArray<string>;
declare function resolveRegistryInstallSecrets(entry: PluginRegistryEntry, input: {
  readonly secrets_by_env?: Readonly<Record<string, string>> | undefined;
  readonly credential_value?: string | undefined;
}): {
  readonly secrets_by_env: Readonly<Record<string, string>>;
  readonly missing_required_envs: ReadonlyArray<string>;
  readonly unexpected_envs: ReadonlyArray<string>;
  readonly primary_auth_env: string | undefined;
};
declare function resolveCredentialNameForEnv(entry: PluginRegistryEntry, env: string): string;
//#endregion
export { ICON_HOST_OVERRIDES, LOCAL_ICONS, LOCAL_ICON_PATHS, type LocalIcon, type LocalIconSingle, type LocalIconStyle, type LocalIconThemed, PLUGIN_REGISTRY, POPULARITY, POPULARITY_DEFAULT, PluginCategory, PluginRegistryApiSetup, PluginRegistryApiSetupVerifyProbe, PluginRegistryCliSetup, PluginRegistryCliSetupFailureHint, PluginRegistryCliSetupFailureMatcher, PluginRegistryCliSetupRequiredSecret, PluginRegistryCliSetupRunnableRequirement, PluginRegistryCliSetupVerifyProbe, PluginRegistryEntry, PluginRegistryEntryAvailability, PluginRegistryListResult, PluginRegistryListResultWithoutManifest, PluginRegistryManifest, PluginRegistryManifestTool, PluginRegistryManifestToolBinding, PluginRegistryPublicEntry, PluginRegistryPublicEntryWithoutManifest, type RegistryAvailability, type RegistryAvailabilityReason, type RegistryAvailabilityStatus, countCallableManifestTools, faviconUrl, getAllowedSecretEnvs, getLocalIcon, getLocalIconPath, getLocalIconStyle, getRegistryEntry, getRequiredSecretEnvs, getRequiredSecrets, isLocalIconUrl, listRegistryEntries, resolveCredentialNameForEnv, resolveRegistryInstallSecrets, tryHost };
//# sourceMappingURL=base.d.mts.map