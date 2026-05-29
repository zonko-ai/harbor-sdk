import { Schema } from "effect";

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
//#endregion
//#region ../core-effect/src/catalog.d.ts
type CatalogEntry = PluginRegistryEntry;
type CatalogAvailability = RegistryAvailability;
interface CatalogAvailabilityRules {
  readonly manual_oauth_setup_slugs: readonly string[];
  readonly client_secret_required_slugs: readonly string[];
  readonly global_client_enabled_slugs: readonly string[];
  readonly known_broken_slugs: readonly string[];
  readonly superseded_by_kind: Readonly<Record<string, string>>;
  readonly install_verification_pending_slugs: readonly string[];
}
//#endregion
export { CatalogAvailability, CatalogAvailabilityRules, CatalogEntry };
//# sourceMappingURL=catalog.d.mts.map