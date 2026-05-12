import { describe, expect, it } from 'bun:test'
import { Schema } from 'effect'
import {
  countCallableManifestTools,
  getAllowedSecretEnvs,
  getRegistryEntry,
  getRequiredSecretEnvs,
  listRegistryEntries,
  PluginRegistryEntry,
  resolveCredentialNameForEnv,
  resolveRegistryInstallSecrets,
} from '../src/index'

describe('registry CLI entries', () => {
  it('includes zero-config built-in CLI entries', () => {
    const git = getRegistryEntry('git-cli')
    const echo = getRegistryEntry('echo-cli')
    const gh = getRegistryEntry('gh-cli')
    const vercel = getRegistryEntry('vercel-cli')
    const modal = getRegistryEntry('modal-cli')

    expect(git?.kind).toBe('cli')
    expect(git?.default_namespace).toBe('git')
    expect(git?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'status',
        'branch_list',
        'log',
        'head_sha',
        'show',
        'diff',
        'remote',
        'tag',
      ])
    )
    expect(echo?.kind).toBe('cli')
    expect(echo?.default_namespace).toBe('echo')
    expect(echo?.manifest?.tools.length).toBe(1)
    expect(git?.description.toLowerCase().includes('read-only')).toBe(false)
    expect(git?.config.cli_allowed_env_keys).toEqual([])
    expect(echo?.config.cli_allowed_env_keys).toEqual([])
    expect(git?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(echo?.config.sand_sandbox_policy).toEqual({ filesystem: 'none' })
    expect(gh?.kind).toBe('cli')
    expect(vercel?.kind).toBe('cli')
    expect(modal?.kind).toBe('cli')
    expect(gh?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'repo_view',
        'pr_list',
        'pr_view',
        'pr_comment',
        'issue_list',
        'issue_view',
        'run_list',
        'run_view',
        'release_list',
        'release_view',
      ])
    )
    expect(vercel?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'whoami',
        'project_list',
        'env_list',
        'deploy',
        'list',
        'logs',
        'domains_ls',
      ])
    )
    expect(modal?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'app_list',
        'app_history',
        'app_logs',
        'deploy',
        'secret_list',
        'volume_list',
      ])
    )
    expect(gh?.config.sand_secret_bindings?.map((s) => s.env)).toEqual(['GH_TOKEN'])
    expect(vercel?.config.sand_secret_bindings?.map((s) => s.env)).toEqual(['VERCEL_TOKEN'])
    expect(modal?.config.sand_secret_bindings?.map((s) => s.env)).toEqual([
      'MODAL_TOKEN_ID',
      'MODAL_TOKEN_SECRET',
    ])
    expect(gh?.config.cli_allowed_env_keys).toEqual(['GH_HOST'])
    expect(vercel?.config.cli_allowed_env_keys).toEqual([
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      'VERCEL_SCOPE',
    ])
    expect(modal?.config.cli_allowed_env_keys).toEqual(['MODAL_ENVIRONMENT'])
    expect(gh?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(vercel?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(modal?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(git?.config.sand_runtime?.artifacts?.map((artifact) => artifact.id)).toEqual([
      'git_config_home',
      'git_config_global',
    ])
    expect(gh?.config.sand_runtime?.env?.map((binding) => binding.env)).toEqual([
      'GH_CONFIG_DIR',
      'GH_PROMPT_DISABLED',
    ])
    expect(vercel?.config.sand_runtime?.args?.map((part) => part.kind)).toEqual([
      'literal',
      'artifact_path',
      'literal',
      'secret_env',
    ])
    expect(modal?.config.cli_launcher).toBe('uvx')
  })

  it('includes token-backed CLI entries with non-interactive auth and sandbox isolation', () => {
    const wrangler = getRegistryEntry('wrangler-cli')
    const aws = getRegistryEntry('aws-cli')
    const convex = getRegistryEntry('convex-cli')
    const glab = getRegistryEntry('glab-cli')

    expect(wrangler?.kind).toBe('cli')
    expect(aws?.kind).toBe('cli')
    expect(convex?.kind).toBe('cli')
    expect(glab?.kind).toBe('cli')
    expect(wrangler?.default_namespace).toBe('wrangler')
    expect(aws?.default_namespace).toBe('aws')
    expect(convex?.default_namespace).toBe('convex')
    expect(glab?.default_namespace).toBe('glab')
    expect(wrangler?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'version',
        'whoami',
        'deployments_list',
        'd1_list',
        'kv_namespace_list',
        'r2_bucket_list',
        'queues_list',
        'pages_project_list',
      ])
    )
    expect(aws?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'version',
        'sts_get_caller_identity',
        'region_list',
        's3_bucket_list',
        'lambda_list_functions',
        'cloudformation_list_stacks',
        'logs_describe_log_groups',
        'sqs_list_queues',
        'dynamodb_list_tables',
        'ec2_describe_instances',
      ])
    )
    expect(convex?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining(['function_spec', 'tables', 'data', 'logs'])
    )
    expect(glab?.manifest?.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'version',
        'auth_status',
        'repo_list',
        'mr_list',
        'mr_view',
        'issue_list',
        'issue_view',
        'pipeline_list',
        'pipeline_view',
      ])
    )
    expect(wrangler?.config.cli_launcher).toBe('binary')
    expect(aws?.config.cli_launcher).toBe('binary')
    expect(convex?.config.cli_launcher).toBe('binary')
    expect(glab?.config.cli_launcher).toBe('binary')
    expect(wrangler?.config.cli_allowed_env_keys).toEqual(['CF_ACCOUNT_ID'])
    expect(aws?.config.cli_allowed_env_keys).toEqual(['AWS_REGION', 'AWS_PROFILE'])
    expect(convex?.config.cli_allowed_env_keys).toEqual(['CONVEX_DEPLOYMENT'])
    expect(glab?.config.cli_allowed_env_keys).toEqual(['GITLAB_HOST', 'GL_HOST'])
    expect(wrangler?.config.sand_secret_bindings?.map((binding) => binding.env)).toEqual([
      'CF_API_TOKEN',
    ])
    expect(aws?.config.sand_secret_bindings?.map((binding) => binding.env)).toEqual([
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_SESSION_TOKEN',
    ])
    expect(convex?.config.sand_secret_bindings?.map((binding) => binding.env)).toEqual([
      'CONVEX_DEPLOY_KEY',
    ])
    expect(glab?.config.sand_secret_bindings?.map((binding) => binding.env)).toEqual([
      'GITLAB_TOKEN',
    ])
    expect(wrangler?.cli_setup.required_secrets.map((secret) => secret.env)).toEqual([
      'CF_API_TOKEN',
    ])
    expect(aws?.cli_setup.required_secrets.map((secret) => secret.env)).toEqual([
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_SESSION_TOKEN',
    ])
    expect(aws?.cli_setup.required_secrets.map((secret) => secret.required)).toEqual([
      true,
      true,
      false,
    ])
    expect(convex?.cli_setup.required_secrets.map((secret) => secret.env)).toEqual([
      'CONVEX_DEPLOY_KEY',
    ])
    expect(glab?.cli_setup.required_secrets.map((secret) => secret.env)).toEqual(['GITLAB_TOKEN'])
    expect(aws?.config.sand_runtime?.env?.map((binding) => binding.env)).toEqual([
      'AWS_PAGER',
      'AWS_CLI_AUTO_PROMPT',
      'AWS_EC2_METADATA_DISABLED',
    ])
    expect(convex?.config.sand_runtime?.artifacts?.map((artifact) => artifact.id)).toEqual([
      'convex_home',
    ])
    expect(convex?.config.sand_runtime?.env?.map((binding) => binding.env)).toEqual(['HOME'])
    expect(glab?.config.sand_runtime?.artifacts?.map((artifact) => artifact.id)).toEqual([
      'glab_config_dir',
    ])
    expect(glab?.config.sand_runtime?.env?.map((binding) => binding.env)).toEqual([
      'GLAB_CONFIG_DIR',
      'GLAB_CHECK_UPDATE',
      'GLAB_SEND_TELEMETRY',
      'NO_PROMPT',
    ])
    expect(wrangler?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(aws?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(convex?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
    expect(glab?.config.sand_sandbox_policy).toEqual({ filesystem: 'workspace' })
  })

  it('attaches canonical CLI setup metadata to every shipped CLI entry', () => {
    const entries = [
      'git-cli',
      'echo-cli',
      'gh-cli',
      'vercel-cli',
      'modal-cli',
      'wrangler-cli',
      'aws-cli',
      'convex-cli',
      'glab-cli',
    ].map((slug) => getRegistryEntry(slug))

    expect(entries).toHaveLength(9)
    for (const entry of entries) {
      expect(entry?.kind).toBe('cli')
      expect(entry?.cli_setup.links.length).toBeGreaterThan(0)
      expect(entry?.cli_setup.runnable.summary.length).toBeGreaterThan(0)
      expect(entry?.cli_setup.runnable.required_programs.length).toBeGreaterThan(0)
      expect(entry?.cli_setup.verify_probe.args.length).toBeGreaterThan(0)
      expect(entry?.cli_setup.verify_probe.success_message.length).toBeGreaterThan(0)
      expect(entry?.cli_setup.failure_hints.length).toBeGreaterThan(0)
      for (const hint of entry?.cli_setup.failure_hints ?? []) {
        expect(hint.matchers.length).toBeGreaterThan(0)
        expect(hint.message.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps CLI setup secret display metadata aligned with runtime secret bindings', () => {
    const cliEntries = [
      'git-cli',
      'echo-cli',
      'gh-cli',
      'vercel-cli',
      'modal-cli',
      'wrangler-cli',
      'aws-cli',
      'convex-cli',
      'glab-cli',
    ]
      .map((slug) => getRegistryEntry(slug))
      .filter(
        (entry): entry is Extract<PluginRegistryEntry, { kind: 'cli' }> => entry?.kind === 'cli'
      )

    expect(cliEntries).toHaveLength(9)
    for (const entry of cliEntries) {
      const boundSecretEnvs = entry.config.sand_secret_bindings?.map((binding) => binding.env) ?? []
      const boundSecretRequired =
        entry.config.sand_secret_bindings?.map((binding) => binding.required !== false) ?? []
      const displayedSecretEnvs = entry.cli_setup.required_secrets.map((secret) => secret.env)
      const displayedSecretRequired = entry.cli_setup.required_secrets.map(
        (secret) => secret.required
      )
      expect(displayedSecretEnvs).toEqual(boundSecretEnvs)
      expect(displayedSecretRequired).toEqual(boundSecretRequired)
      expect(
        entry.cli_setup.required_secrets.every((secret) => secret.display_name.length > 0)
      ).toBe(true)
      expect(
        entry.cli_setup.required_secrets.every((secret) => secret.description.length > 0)
      ).toBe(true)
    }
  })

  it('treats CLI entries as first-class catalog entries', () => {
    const git = getRegistryEntry('git-cli')
    expect(git).toBeTruthy()
    expect(git?.kind).toBe('cli')
    expect(git?.default_namespace).toBe('git')
  })

  it('keeps catalog listing backward compatible while including CLI entries', () => {
    const entries = listRegistryEntries('dev')
    expect(entries.some((entry) => entry.slug === 'git-cli')).toBe(true)
    expect(entries.some((entry) => entry.slug === 'gh-cli')).toBe(true)
    expect(entries.some((entry) => entry.slug === 'glab-cli')).toBe(true)
    expect(entries.some((entry) => entry.slug === 'deepwiki-mcp')).toBe(true)
    expect(listRegistryEntries('observability').some((entry) => entry.slug === 'axiom-api')).toBe(
      true
    )
    expect(listRegistryEntries('comms').some((entry) => entry.slug === 'resend-api')).toBe(true)
    expect(listRegistryEntries('infra').some((entry) => entry.slug === 'wrangler-cli')).toBe(true)
    expect(listRegistryEntries('infra').some((entry) => entry.slug === 'aws-cli')).toBe(true)
    expect(listRegistryEntries('infra').some((entry) => entry.slug === 'convex-cli')).toBe(true)
  })

  it('ships API registry entries as official spec imports with curated static manifests where needed', () => {
    const openApiSpecs = {
      'github-rest-api':
        'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
      'cloudflare-api':
        'https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json',
      'gitlab-rest-api':
        'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/api/openapi/openapi_v2.yaml',
      'digitalocean-api':
        'https://raw.githubusercontent.com/digitalocean/openapi/main/specification/DigitalOcean-public.v2.yaml',
      'asana-api': 'https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml',
      'twilio-api':
        'https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_api_v2010.json',
      'axiom-api': 'https://axiom.co/docs/restapi/versions/v2.json',
      'resend-api': 'https://raw.githubusercontent.com/resend/resend-openapi/main/resend.yaml',
      'openrouter-api': 'https://openrouter.ai/openapi.json',
      'openai-api': 'https://app.stainless.com/api/spec/documented/openai/openapi.documented.yml',
      'xai-api': 'https://api.x.ai/api-docs/openapi.json',
      'perplexity-api': 'https://docs.perplexity.ai/openapi.json',
      'open-meteo-api': 'https://raw.githubusercontent.com/open-meteo/open-meteo/main/openapi.yml',
      'polymarket-gamma-api': 'https://gamma-api.polymarket.com/openapi.json',
      'kalshi-api': 'https://docs.kalshi.com/openapi.yaml',
      'browser-use-api': 'https://docs.browser-use.com/cloud/openapi/v3.json',
      'stripe-api': 'https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json',
      'vercel-api': 'https://openapi.vercel.sh/',
      'sentry-api':
        'https://raw.githubusercontent.com/getsentry/sentry-api-schema/main/openapi-derefed.json',
      'figma-api':
        'https://raw.githubusercontent.com/figma/rest-api-spec/main/openapi/openapi.yaml',
      'supabase-api': 'https://api.supabase.com/api/v1-json',
      'netlify-api': 'https://open-api.netlify.com/openapi.json',
      'sendgrid-api':
        'https://raw.githubusercontent.com/twilio/sendgrid-oai/main/spec/json/tsg_mail_v3.json',
    }

    for (const [slug, specUrl] of Object.entries(openApiSpecs)) {
      const entry = getRegistryEntry(slug)
      expect(entry?.kind).toBe('api')
      expect(entry?.icon_url?.startsWith('/plugin-icons/')).toBe(true)
      expect(entry?.config.api_protocol).toBe('openapi')
      expect(entry?.config.api_spec_url).toBe(specUrl)
      expect(entry?.api_setup.spec_url).toBe(specUrl)
      // OpenAPI-backed entries must not ship hand-rolled manifest tools — the
      // spec is the single source of truth for the tool surface.
      expect(entry?.manifest?.tools).toBeUndefined()
    }

    const xEntry = getRegistryEntry('x-api')
    expect(xEntry?.kind).toBe('api')
    expect(xEntry?.config.api_protocol).toBe('openapi')
    expect(xEntry?.config.api_base_url).toBe('https://api.x.com')
    expect(xEntry?.config.api_allowed_hosts).toEqual(['api.x.com'])
    expect(xEntry?.config.api_spec_url).toBe(xEntry?.api_setup.spec_url)

    const graphqlEntries = {
      'linear-graphql': 'https://api.linear.app/graphql',
      'github-graphql': 'https://api.github.com/graphql',
    }
    for (const [slug, endpoint] of Object.entries(graphqlEntries)) {
      const entry = getRegistryEntry(slug)
      expect(entry?.kind).toBe('api')
      expect(entry?.icon_url?.startsWith('/plugin-icons/')).toBe(true)
      expect(entry?.config.api_protocol).toBe('graphql')
      expect(entry?.config.api_graphql_endpoint).toBe(endpoint)
      expect(entry?.api_setup.graphql_endpoint).toBe(endpoint)
      expect(entry?.manifest?.tools).toBeUndefined()
    }
    const linear = getRegistryEntry('linear-graphql')
    expect(linear?.kind).toBe('api')
    if (linear?.kind === 'api') {
      expect(linear.auth.prefix).toBe('')
      expect(linear.config.api_auth?.prefix).toBe('')
      expect(linear.manifest?.tools).toBeUndefined()
    }

    for (const apiEntry of listRegistryEntries().filter((entry) => entry.kind === 'api')) {
      expect(apiEntry.manifest?.tools).toBeUndefined()
    }

    for (const slug of [
      'anthropic-api',
      'reddit-api',
      'youtube-data-api',
      'meta-ads-library-api',
      'polymarket-api',
      'apollo-api',
    ]) {
      expect(getRegistryEntry(slug)).toBeUndefined()
    }
  })

  it('attaches canonical API setup metadata to every shipped API entry', () => {
    const entries = listRegistryEntries().filter((entry) => entry.kind === 'api')

    expect(entries.length).toBeGreaterThanOrEqual(13)
    for (const entry of entries) {
      expect(entry.kind).toBe('api')
      expect(entry.api_setup.links.length).toBeGreaterThan(0)
      expect(entry.api_setup.base_url.length).toBeGreaterThan(0)
      expect(entry.api_setup.auth_mode.length).toBeGreaterThan(0)
      expect(entry.api_setup.verify_probe.success_message.length).toBeGreaterThan(0)
      expect(entry.api_setup.failure_hints.length).toBeGreaterThan(0)
      const declaredSecretEnvs = entry.api_setup.required_secrets.map((secret) => secret.env)
      expect(
        getRequiredSecretEnvs(entry).filter((env) => declaredSecretEnvs.includes(env))
      ).toEqual(declaredSecretEnvs)
      expect(entry.api_setup.auth_mode).toBe(entry.auth.method)
    }
  })

  it('requires CLI registry entries to include concrete sand launcher config', () => {
    expect(() =>
      Schema.decodeUnknownSync(PluginRegistryEntry)({
        slug: 'bad-cli',
        display_name: 'Bad CLI',
        description: 'missing command and manifest',
        category: 'dev',
        kind: 'cli',
        cli_setup: {
          links: [],
          required_secrets: [],
          runnable: {
            summary: 'Requires `bad` in PATH.',
            required_programs: ['bad'],
          },
          verify_probe: {
            args: ['--version'],
            success_message: 'Prints a version string.',
          },
          failure_hints: [
            {
              matchers: [{ kind: 'substring', pattern: 'ENOENT' }],
              message: 'Install the CLI before using it in Harbor.',
            },
          ],
        },
        config: {
          cli_launcher: 'binary',
          cli_cwd_policy: 'workspace',
        },
        auth: {
          method: 'none',
          required_secrets: [],
        },
        default_namespace: 'bad-cli',
      })
    ).toThrow()
  })

  it('requires cli setup metadata on CLI registry entries', () => {
    expect(() =>
      Schema.decodeUnknownSync(PluginRegistryEntry)({
        slug: 'missing-setup-cli',
        display_name: 'Missing Setup CLI',
        description: 'missing canonical setup metadata',
        category: 'dev',
        kind: 'cli',
        config: {
          cli_launcher: 'binary',
          cli_command: 'echo',
          cli_cwd_policy: 'call',
        },
        auth: {
          method: 'none',
          required_secrets: [],
        },
        default_namespace: 'missing-setup',
        manifest: {
          tools: [],
        },
      })
    ).toThrow()
  })

  it('rejects malformed registry slugs and secret env names', () => {
    expect(() =>
      Schema.decodeUnknownSync(PluginRegistryEntry)({
        slug: 'Bad Slug',
        display_name: 'Broken MCP',
        description: 'bad slug and secret key',
        category: 'dev',
        kind: 'mcp',
        config: {
          mcp_endpoint: 'https://example.com/mcp',
          mcp_transport: 'http',
        },
        auth: {
          method: 'header',
          required_secrets: ['bad-secret'],
        },
        default_namespace: 'broken-mcp',
      })
    ).toThrow()
  })

  it('decodes API registry entries with API request and GraphQL bindings', () => {
    const entry = Schema.decodeUnknownSync(PluginRegistryEntry)({
      slug: 'example-api',
      display_name: 'Example API',
      description: 'HTTP and GraphQL API source',
      category: 'data',
      kind: 'api',
      config: {
        api_base_url: 'https://api.example.com',
        api_timeout_ms: 10_000,
        api_auth: {
          method: 'header',
          env: 'GLOBAL_API_KEY',
          secret_name: 'global_api_key',
          header_name: 'x-api-key',
        },
      },
      auth: {
        method: 'header',
        header_name: 'x-api-key',
        required_secrets: ['GLOBAL_API_KEY'],
      },
      api_setup: {
        links: [
          {
            label: 'Docs',
            url: 'https://api.example.com/docs',
            kind: 'docs',
          },
        ],
        base_url: 'https://api.example.com',
        auth_mode: 'header',
        required_secrets: [
          {
            env: 'GLOBAL_API_KEY',
            display_name: 'Example API key',
            description: 'API key used to authenticate example requests.',
            required: true,
          },
        ],
        verify_probe: {
          kind: 'request',
          method: 'GET',
          path: '/users',
          expected_status: 200,
          success_message: 'Returns a simple example API payload.',
        },
        failure_hints: [],
      },
      default_namespace: 'example_api',
      manifest: {
        tools: [
          {
            tool_id: 'search_users',
            name: 'search_users',
            display_name: 'Search Users',
            binding: {
              kind: 'api_request',
              method: 'GET',
              path: '/users',
              auth: {
                method: 'bearer',
                env: 'SECONDARY_TOKEN',
                secret_name: 'secondary_token',
                required: false,
              },
            },
          },
          {
            tool_id: 'repo_lookup',
            name: 'repo_lookup',
            display_name: 'Repo Lookup',
            binding: {
              kind: 'api_graphql',
              path: '/graphql',
              document: 'query Repo($name: String!) { repo(name: $name) { id } }',
              operation_name: 'Repo',
              auth: {
                method: 'basic',
                username_env: 'API_USER',
                username_secret_name: 'api_user',
                password_env: 'API_PASS',
                password_secret_name: 'api_pass',
              },
            },
          },
        ],
      },
    })

    expect(entry.kind).toBe('api')
    expect(entry.config.api_base_url).toBe('https://api.example.com')
    expect(entry.manifest?.tools.length).toBe(2)
    expect(entry.manifest?.tools[0]?.binding.kind).toBe('api_request')
    expect(entry.manifest?.tools[1]?.binding.kind).toBe('api_graphql')
  })

  it('rejects malformed API auth secret env names', () => {
    expect(() =>
      Schema.decodeUnknownSync(PluginRegistryEntry)({
        slug: 'broken-api',
        display_name: 'Broken API',
        description: 'invalid secret env key',
        category: 'data',
        kind: 'api',
        config: {
          api_base_url: 'https://api.example.com',
          api_auth: {
            method: 'bearer',
            env: 'bad-key',
          },
        },
        auth: {
          method: 'bearer',
          required_secrets: [],
        },
        api_setup: {
          links: [
            {
              label: 'Docs',
              url: 'https://api.example.com/docs',
              kind: 'docs',
            },
          ],
          base_url: 'https://api.example.com',
          auth_mode: 'bearer',
          required_secrets: [],
          verify_probe: {
            kind: 'request',
            method: 'GET',
            path: '/health',
            success_message: 'Returns a health check payload.',
          },
          failure_hints: [],
        },
        default_namespace: 'broken_api',
      })
    ).toThrow()
  })

  it('requires API setup metadata on API registry entries', () => {
    expect(() =>
      Schema.decodeUnknownSync(PluginRegistryEntry)({
        slug: 'missing-setup-api',
        display_name: 'Missing Setup API',
        description: 'missing canonical API setup metadata',
        category: 'dev',
        kind: 'api',
        config: {
          api_base_url: 'https://api.example.com',
        },
        auth: {
          method: 'none',
          required_secrets: [],
        },
        default_namespace: 'missing_setup_api',
      })
    ).toThrow()
  })

  it('counts callable manifest bindings and resolves API secret env helpers', () => {
    const entry = Schema.decodeUnknownSync(PluginRegistryEntry)({
      slug: 'secret-helper-api',
      display_name: 'Secret Helper API',
      description: 'API helper test fixture',
      category: 'dev',
      kind: 'api',
      config: {
        api_base_url: 'https://api.example.com',
        api_auth: {
          method: 'header',
          env: 'GLOBAL_API_KEY',
          secret_name: 'global_api_key',
        },
      },
      auth: {
        method: 'header',
        header_name: 'x-api-key',
        required_secrets: ['GLOBAL_API_KEY'],
      },
      api_setup: {
        links: [
          {
            label: 'Docs',
            url: 'https://api.example.com/docs',
            kind: 'docs',
          },
        ],
        base_url: 'https://api.example.com',
        auth_mode: 'header',
        required_secrets: [
          {
            env: 'GLOBAL_API_KEY',
            display_name: 'Global API key',
            description: 'Credential used to authenticate API helper requests.',
            required: true,
          },
        ],
        verify_probe: {
          kind: 'request',
          method: 'GET',
          path: '/lookup',
          expected_status: 200,
          success_message: 'Returns a simple lookup payload.',
        },
        failure_hints: [],
      },
      default_namespace: 'secret_helper_api',
      manifest: {
        tools: [
          {
            tool_id: 'lookup',
            name: 'lookup',
            display_name: 'Lookup',
            binding: {
              kind: 'api_request',
              method: 'GET',
              path: '/lookup',
              auth: {
                method: 'bearer',
                env: 'SECONDARY_TOKEN',
                secret_name: 'secondary_token',
                required: false,
              },
            },
          },
          {
            tool_id: 'graphql_lookup',
            name: 'graphql_lookup',
            display_name: 'GraphQL Lookup',
            binding: {
              kind: 'api_graphql',
              document: 'query Q { viewer { id } }',
              auth: {
                method: 'basic',
                username_env: 'API_USER',
                username_secret_name: 'api_user',
                password_env: 'API_PASS',
                password_secret_name: 'api_pass',
              },
            },
          },
        ],
      },
    })

    expect(getRequiredSecretEnvs(entry).slice().sort()).toEqual([
      'API_PASS',
      'API_USER',
      'GLOBAL_API_KEY',
    ])
    expect(getAllowedSecretEnvs(entry).slice().sort()).toEqual([
      'API_PASS',
      'API_USER',
      'GLOBAL_API_KEY',
      'SECONDARY_TOKEN',
    ])
    expect(resolveCredentialNameForEnv(entry, 'GLOBAL_API_KEY')).toBe('global_api_key')
    expect(resolveCredentialNameForEnv(entry, 'API_USER')).toBe('api_user')
    expect(resolveCredentialNameForEnv(entry, 'SECONDARY_TOKEN')).toBe('secondary_token')
    expect(resolveCredentialNameForEnv(entry, 'UNKNOWN_ENV')).toBe('UNKNOWN_ENV')

    const resolved = resolveRegistryInstallSecrets(entry, {
      secrets_by_env: {
        GLOBAL_API_KEY: '  key_123  ',
        API_PASS: 'pass_123',
        EXTRA_SECRET: 'should_be_flagged',
      },
    })
    expect(resolved.secrets_by_env.GLOBAL_API_KEY).toBe('key_123')
    expect(resolved.missing_required_envs).toEqual(['API_USER'])
    expect(resolved.unexpected_envs).toEqual(['EXTRA_SECRET'])
    expect(resolved.primary_auth_env).toBe('GLOBAL_API_KEY')

    const callableCount = countCallableManifestTools([
      ...(entry.manifest?.tools ?? []),
      {
        tool_id: 'non_callable',
        name: 'non_callable',
        display_name: 'Non Callable',
        binding: { kind: 'mcp_prompt', prompt_name: 'setup' },
      } as never,
    ])
    expect(callableCount).toBe(2)
  })
})
