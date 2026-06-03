import { Context, Effect, Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitArtifactRef: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly content_type: Schema.optional<Schema.String>;
  readonly size_bytes: Schema.optional<Schema.Number>;
}>;
type OrbitArtifactRef = typeof OrbitArtifactRef.Type;
//#endregion
//#region ../core-effect/src/registry.d.ts
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
  readonly popularity: Schema.optional<Schema.Number>;
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
  readonly popularity: Schema.optional<Schema.Number>;
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
  readonly popularity: Schema.optional<Schema.Number>;
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
  readonly popularity: Schema.optional<Schema.Number>;
  readonly is_oauth_client_configured: Schema.optional<Schema.Boolean>;
}>]>;
type PluginRegistryEntry = typeof PluginRegistryEntry.Type;
//#endregion
//#region ../core-effect/src/scalars.d.ts
declare const WorkspaceId: Schema.String;
type WorkspaceId = typeof WorkspaceId.Type;
declare const RunId: Schema.String;
type RunId = typeof RunId.Type;
declare const SourceNamespace: Schema.String;
type SourceNamespace = typeof SourceNamespace.Type;
declare const ToolId: Schema.NonEmptyString;
type ToolId = typeof ToolId.Type;
declare const SecretName: Schema.String;
type SecretName = typeof SecretName.Type;
//#endregion
//#region ../core-effect/src/source.d.ts
declare const Source: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly slug: Schema.optional<Schema.String>;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api", "composio"]>;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly config: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"mcp">;
    readonly endpoint: Schema.NonEmptyString;
    readonly transport: Schema.Literals<readonly ["http", "sse", "auto"]>;
    readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
    readonly oauth_redirect_url: Schema.optional<Schema.String>;
    readonly oauth_scopes: Schema.optional<Schema.$Array<Schema.String>>;
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
    readonly oauth_client_config: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.String>;
      readonly client_secret: Schema.optional<Schema.String>;
      readonly redirect_uri: Schema.optional<Schema.String>;
      readonly scope: Schema.optional<Schema.String>;
    }>>;
    readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"cli">;
    readonly namespace: Schema.String;
    readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly command: Schema.NonEmptyString;
    readonly args: Schema.optional<Schema.$Array<Schema.String>>;
    readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api">;
    readonly namespace: Schema.String;
    readonly base_url: Schema.NonEmptyString;
    readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
    readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
  }>]>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type Source = typeof Source.Type;
//#endregion
//#region ../core-effect/src/plugin.d.ts
declare const PluginTool: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly tool_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly title: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly input_type: Schema.optional<Schema.String>;
  readonly output_type: Schema.optional<Schema.String>;
  readonly type_definitions: Schema.optional<Schema.String>;
  readonly annotations: Schema.optional<Schema.Unknown>;
  readonly icons: Schema.optional<Schema.Unknown>;
  readonly binding: Schema.Unknown;
  readonly tags: Schema.optional<Schema.NullOr<Schema.$Array<Schema.NonEmptyString>>>;
  readonly types: Schema.optional<Schema.String>;
  readonly created_at: Schema.String;
  readonly namespace: Schema.optional<Schema.String>;
  readonly js_var: Schema.optional<Schema.String>;
  readonly signature: Schema.optional<Schema.String>;
}>;
type PluginTool = typeof PluginTool.Type;
declare const ToolInvocationResult: Schema.Struct<{
  readonly tool_id: Schema.NonEmptyString;
  readonly ok: Schema.Boolean;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
}>;
type ToolInvocationResult = typeof ToolInvocationResult.Type;
//#endregion
//#region ../core-effect/src/run.d.ts
declare const Run: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
  readonly status: Schema.Literals<readonly ["queued", "running", "completed", "failed", "cancelled"]>;
  readonly source: Schema.Literals<readonly ["api", "cli", "worker"]>;
  readonly trigger: Schema.NullOr<Schema.String>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly error_code: Schema.NullOr<Schema.String>;
  readonly exit_code: Schema.NullOr<Schema.Number>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly artifact_count: Schema.Number;
  readonly workflow_instance_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly started_at: Schema.NullOr<Schema.String>;
  readonly finished_at: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly sources: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type Run = typeof Run.Type;
declare const CreateRunBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.optional<Schema.String>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly trigger: Schema.optional<Schema.String>;
}>;
type CreateRunBody = typeof CreateRunBody.Type;
//#endregion
//#region ../core-effect/src/runtime.d.ts
declare const RuntimeExecutionRequest: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly kind: Schema.Literals<readonly ["exec", "tool_invocation", "workflow"]>;
  readonly run_id: Schema.optional<Schema.String>;
  readonly payload: Schema.Unknown;
  readonly low_level: Schema.optional<Schema.Struct<{
    readonly workspace_id: Schema.String;
    readonly runtime: Schema.Literals<readonly ["codemode", "node", "bun"]>;
    readonly entrypoint: Schema.NonEmptyString;
    readonly files: Schema.$Record<Schema.String, Schema.String>;
    readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
    readonly secrets: Schema.optional<Schema.$Array<Schema.String>>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
}>;
type RuntimeExecutionRequest = typeof RuntimeExecutionRequest.Type;
declare const RuntimeExecutionResult: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly run_id: Schema.optional<Schema.String>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly low_level: Schema.optional<Schema.Struct<{
    readonly ok: Schema.Boolean;
    readonly stdout: Schema.String;
    readonly stderr: Schema.String;
    readonly result: Schema.optional<Schema.Unknown>;
    readonly error: Schema.optional<Schema.String>;
  }>>;
}>;
type RuntimeExecutionResult = typeof RuntimeExecutionResult.Type;
//#endregion
//#region ../core-effect/src/services.d.ts
interface WorkspaceAuthorizer {
  readonly requireWorkspaceAccess: (workspaceId: WorkspaceId, action: string) => Effect.Effect<void, WorkspaceAuthorizationError>;
}
declare class WorkspaceAuthorizationError extends Error {
  readonly workspaceId: WorkspaceId;
  readonly action: string;
  readonly reason: string;
  readonly _tag = "WorkspaceAuthorizationError";
  constructor(workspaceId: WorkspaceId, action: string, reason: string);
}
declare const WorkspaceAuthorizer: Context.Service<WorkspaceAuthorizer, WorkspaceAuthorizer>;
interface RunStore {
  readonly create: (body: CreateRunBody) => Effect.Effect<Run, RunStoreError>;
  readonly get: (workspaceId: WorkspaceId, runId: RunId) => Effect.Effect<Run, RunStoreError>;
  readonly complete: (workspaceId: WorkspaceId, runId: RunId, output: unknown) => Effect.Effect<Run, RunStoreError>;
  readonly fail: (workspaceId: WorkspaceId, runId: RunId, error: string) => Effect.Effect<Run, RunStoreError>;
}
declare class RunStoreError extends Error {
  readonly reason: string;
  readonly _tag = "RunStoreError";
  constructor(reason: string);
}
declare const RunStore: Context.Service<RunStore, RunStore>;
interface CredentialStore {
  readonly getSecret: (workspaceId: WorkspaceId, name: SecretName) => Effect.Effect<string, CredentialStoreError>;
  readonly putSecret: (workspaceId: WorkspaceId, name: SecretName, value: string) => Effect.Effect<void, CredentialStoreError>;
  readonly deleteSecret: (workspaceId: WorkspaceId, name: SecretName) => Effect.Effect<void, CredentialStoreError>;
}
declare class CredentialStoreError extends Error {
  readonly reason: string;
  readonly _tag = "CredentialStoreError";
  constructor(reason: string);
}
declare const CredentialStore: Context.Service<CredentialStore, CredentialStore>;
interface SourceRegistry {
  readonly listRegistryEntries: () => Effect.Effect<ReadonlyArray<PluginRegistryEntry>, SourceRegistryError>;
  readonly getRegistryEntry: (slug: string) => Effect.Effect<PluginRegistryEntry | undefined, SourceRegistryError>;
  readonly listWorkspaceSources: (workspaceId: WorkspaceId) => Effect.Effect<ReadonlyArray<Source>, SourceRegistryError>;
  readonly getWorkspaceSource: (workspaceId: WorkspaceId, namespace: SourceNamespace) => Effect.Effect<Source | undefined, SourceRegistryError>;
}
declare class SourceRegistryError extends Error {
  readonly reason: string;
  readonly _tag = "SourceRegistryError";
  constructor(reason: string);
}
declare const SourceRegistry: Context.Service<SourceRegistry, SourceRegistry>;
interface McpSessionPool {
  readonly invokeTool: (tool: PluginTool, input: unknown) => Effect.Effect<ToolInvocationResult, McpSessionPoolError>;
}
declare class McpSessionPoolError extends Error {
  readonly reason: string;
  readonly _tag = "McpSessionPoolError";
  constructor(reason: string);
}
declare const McpSessionPool: Context.Service<McpSessionPool, McpSessionPool>;
interface RuntimeExecutor {
  readonly execute: (request: RuntimeExecutionRequest) => Effect.Effect<RuntimeExecutionResult, RuntimeExecutorError>;
}
declare class RuntimeExecutorError extends Error {
  readonly reason: string;
  readonly _tag = "RuntimeExecutorError";
  constructor(reason: string);
}
declare const RuntimeExecutor: Context.Service<RuntimeExecutor, RuntimeExecutor>;
interface ArtifactStore {
  readonly put: (workspaceId: WorkspaceId, key: string, value: Uint8Array, contentType?: string) => Effect.Effect<OrbitArtifactRef, ArtifactStoreError>;
  readonly get: (workspaceId: WorkspaceId, key: string) => Effect.Effect<Uint8Array | undefined, ArtifactStoreError>;
}
declare class ArtifactStoreError extends Error {
  readonly reason: string;
  readonly _tag = "ArtifactStoreError";
  constructor(reason: string);
}
declare const ArtifactStore: Context.Service<ArtifactStore, ArtifactStore>;
interface ToolCatalog {
  readonly search: (workspaceId: WorkspaceId, query: string) => Effect.Effect<ReadonlyArray<PluginTool>, ToolCatalogError>;
  readonly getById: (workspaceId: WorkspaceId, toolId: ToolId) => Effect.Effect<PluginTool | undefined, ToolCatalogError>;
}
declare class ToolCatalogError extends Error {
  readonly reason: string;
  readonly _tag = "ToolCatalogError";
  constructor(reason: string);
}
declare const ToolCatalog: Context.Service<ToolCatalog, ToolCatalog>;
//#endregion
export { ArtifactStore, ArtifactStoreError, CredentialStore, CredentialStoreError, McpSessionPool, McpSessionPoolError, RunStore, RunStoreError, RuntimeExecutor, RuntimeExecutorError, SourceRegistry, SourceRegistryError, ToolCatalog, ToolCatalogError, WorkspaceAuthorizationError, WorkspaceAuthorizer };
//# sourceMappingURL=services.d.mts.map