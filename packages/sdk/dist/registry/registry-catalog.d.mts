//#region ../registry-catalog/data/v1/catalog.json.d.ts
declare let version: number;
declare let entries: string[];
declare namespace __json_default_export {
  export { version, entries };
}
//#endregion
//#region ../registry-catalog/src/data.d.ts
type RegistryCatalogJson = typeof __json_default_export;
type RegistryCatalogEntryJson = unknown;
declare const REGISTRY_CATALOG_VERSION: number;
declare const REGISTRY_CATALOG_SLUGS: readonly string[];
declare const REGISTRY_CATALOG_ENTRY_BY_SLUG: Readonly<Record<string, RegistryCatalogEntryJson>>;
declare const REGISTRY_CATALOG_ENTRIES: {}[];
declare const REGISTRY_CATALOG_LOCAL_ICONS: {
  "ahrefs-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "airtable-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "amplitude-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "apify-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "apollo-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "openai-api": {
    kind: string;
    path: string;
    style: string;
  };
  "anthropic-api": {
    kind: string;
    path: string;
    style: string;
  };
  "xai-api": {
    kind: string;
    path: string;
    style: string;
  };
  "perplexity-api": {
    kind: string;
    path: string;
    style: string;
  };
  "discord-api": {
    kind: string;
    path: string;
    style: string;
  };
  "linear-graphql": {
    kind: string;
    path: string;
    style: string;
  };
  "github-graphql": {
    kind: string;
    path: string;
    style: string;
  };
  "github-rest-api": {
    kind: string;
    path: string;
    style: string;
  };
  "cloudflare-api": {
    kind: string;
    path: string;
    style: string;
  };
  "gitlab-rest-api": {
    kind: string;
    path: string;
    style: string;
  };
  "digitalocean-api": {
    kind: string;
    path: string;
    style: string;
  };
  "asana-api": {
    kind: string;
    path: string;
    style: string;
  };
  "twilio-api": {
    kind: string;
    path: string;
    style: string;
  };
  "axiom-api": {
    kind: string;
    path: string;
    style: string;
  };
  "resend-api": {
    kind: string;
    path: string;
    style: string;
  };
  "open-meteo-api": {
    kind: string;
    path: string;
    style: string;
  };
  "polymarket-gamma-api": {
    kind: string;
    path: string;
    style: string;
  };
  "kalshi-api": {
    kind: string;
    path: string;
    style: string;
  };
  "browser-use-api": {
    kind: string;
    path: string;
    style: string;
  };
  "stripe-api": {
    kind: string;
    path: string;
    style: string;
  };
  "vercel-api": {
    kind: string;
    path: string;
    style: string;
  };
  "sentry-api": {
    kind: string;
    path: string;
    style: string;
  };
  "figma-api": {
    kind: string;
    path: string;
    style: string;
  };
  "supabase-api": {
    kind: string;
    path: string;
    style: string;
  };
  "netlify-api": {
    kind: string;
    path: string;
    style: string;
  };
  "sendgrid-api": {
    kind: string;
    path: string;
    style: string;
  };
  "x-api": {
    kind: string;
    path: string;
    style: string;
  };
  "asana-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "atlassian-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "attio-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "axiom-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "azure-devops-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "betterstack-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "bitly-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "box-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "brevo-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "brightdata-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "browserbase-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "buffer-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "buildkite-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "calendly-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "canva-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "clerk-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "clickup-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "close-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "cloudflare-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "cloudinary-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "coingecko-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "context7-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "customerio-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "cypress-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "datadog-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "deepwiki-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "devrev-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "digitalocean-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "docusign-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "dodo-payments-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "dropbox-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "exa-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "fal-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "figma-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "firecrawl-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "freshdesk-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "github-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "globalping-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "gh-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "google-maps-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "granola-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "heroku-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "hex-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "hubspot-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "huggingface-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "incidentio-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "instacart-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "intercom-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "jina-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "lambdatest-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "linear-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "make-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "mapbox-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "mercury-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "miro-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "mixpanel-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "mollie-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "monday-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "neon-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "newrelic-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "notion-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "openai-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "openrouter-api": {
    kind: string;
    path: string;
    style: string;
  };
  "openrouter-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "pagerduty-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "parallel-search-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "paypal-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "pinterest-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "plaid-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "plane-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "planetscale-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "posthog-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "prisma-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "pylon-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "ramp-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "render-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "replicate-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "sanity-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "scraperapi-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "scrapingbee-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "semgrep-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "sentry-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "shortcut-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "square-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "stackoverflow-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "stripe-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "stytch-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "supabase-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "tally-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "tavily-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "tigris-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "typeform-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "vercel-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "vercel-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "webflow-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "wix-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "xero-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "you-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "zoom-mcp": {
    kind: string;
    path: string;
    style: string;
  };
  "aws-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "convex-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "modal-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "wrangler-cli": {
    kind: string;
    path: string;
    style: string;
  };
  "gitlab-api": {
    kind: string;
    path: string;
    style: string;
  };
};
declare const REGISTRY_CATALOG_ICON_HOST_OVERRIDES: {
  "deepwiki-mcp": string;
  "context7-mcp": string;
  "browserbase-mcp": string;
  "firecrawl-mcp": string;
  "neon-mcp": string;
  "axiom-mcp": string;
  "stripe-mcp": string;
  "linear-mcp": string;
  "sentry-mcp": string;
  "cloudflare-mcp": string;
  "supabase-mcp": string;
  "posthog-mcp": string;
  "figma-mcp": string;
  "notion-mcp": string;
  "monday-mcp": string;
  "miro-mcp": string;
  "github-mcp": string;
  "atlassian-mcp": string;
  "vercel-mcp": string;
  "digitalocean-mcp": string;
  "planetscale-mcp": string;
  "betterstack-mcp": string;
  "newrelic-mcp": string;
  "buildkite-mcp": string;
  "openai-mcp": string;
  "huggingface-mcp": string;
  "slack-mcp": string;
  "zoom-mcp": string;
  "asana-mcp": string;
  "clickup-mcp": string;
  "airtable-mcp": string;
  "close-mcp": string;
  "apollo-mcp": string;
  "intercom-mcp": string;
  "canva-mcp": string;
  "paypal-mcp": string;
  "square-mcp": string;
  "brevo-mcp": string;
  "amplitude-mcp": string;
  "mixpanel-mcp": string;
  "apify-mcp": string;
  "jina-mcp": string;
  "scrapingbee-mcp": string;
  "brightdata-mcp": string;
  "hubspot-mcp": string;
  "clerk-mcp": string;
  "cloudinary-mcp": string;
  "mapbox-mcp": string;
  "google-maps-mcp": string;
  "semgrep-mcp": string;
  "shortcut-mcp": string;
  "plane-mcp": string;
  "typeform-mcp": string;
  "tally-mcp": string;
  "mercury-mcp": string;
  "webflow-mcp": string;
  "customerio-mcp": string;
  "tigris-mcp": string;
  "box-mcp": string;
  "dropbox-mcp": string;
  "instacart-mcp": string;
  "dodo-payments-mcp": string;
  "pagerduty-mcp": string;
  "fal-mcp": string;
  "exa-mcp": string;
  "parallel-search-mcp": string;
  "you-mcp": string;
  "render-mcp": string;
  "heroku-mcp": string;
  "wix-mcp": string;
  "plaid-mcp": string;
  "cypress-mcp": string;
  "azure-devops-mcp": string;
  "devrev-mcp": string;
  "globalping-mcp": string;
  "scraperapi-mcp": string;
  "coingecko-mcp": string;
  "mollie-mcp": string;
  "docusign-mcp": string;
  "buffer-mcp": string;
  "lambdatest-mcp": string;
  "freshdesk-mcp": string;
  "datadog-mcp": string;
  "stackoverflow-mcp": string;
  "prisma-mcp": string;
  "ramp-mcp": string;
  "stytch-mcp": string;
  "xero-mcp": string;
  "pinterest-mcp": string;
};
declare const REGISTRY_CATALOG_POPULARITY: {
  default: number;
  entries: {
    "github-mcp": number;
    "linear-mcp": number;
    "slack-mcp": number;
    "notion-mcp": number;
    "openai-api": number;
    "stripe-mcp": number;
    "stripe-api": number;
    "figma-mcp": number;
    "sentry-mcp": number;
    "openrouter-api": number;
    "supabase-mcp": number;
    "vercel-cli": number;
    "vercel-mcp": number;
    "vercel-api": number;
    "cloudflare-api": number;
    "cloudflare-mcp": number;
    "posthog-mcp": number;
    "wrangler-cli": number;
    "sentry-api": number;
    "convex-cli": number;
    "github-graphql": number;
    "figma-api": number;
    "github-rest-api": number;
    "discord-api": number;
    "supabase-api": number;
    "aws-cli": number;
    "perplexity-api": number;
    "atlassian-mcp": number;
    "gmail-mcp": number;
    "google-drive-mcp": number;
    "google-sheets-mcp": number;
    "google-docs-mcp": number;
    "google-calendar-mcp": number;
    "linear-graphql": number;
    "hubspot-mcp": number;
    "monday-mcp": number;
    "canva-mcp": number;
    "zoom-mcp": number;
    "asana-mcp": number;
    "calendly-mcp": number;
    "asana-api": number;
    "attio-mcp": number;
    "clickup-mcp": number;
    "apollo-mcp": number;
    "miro-mcp": number;
    "airtable-mcp": number;
    "make-mcp": number;
    "twilio-api": number;
    "datadog-mcp": number;
    "close-mcp": number;
    "prisma-mcp": number;
    "customerio-mcp": number;
    "cloudinary-mcp": number;
    "intercom-mcp": number;
    "semgrep-mcp": number;
    "pagerduty-mcp": number;
    "buildkite-mcp": number;
    "newrelic-mcp": number;
    "xai-api": number;
    "x-api": number;
    "betterstack-mcp": number;
    "shortcut-mcp": number;
    "mixpanel-mcp": number;
    "plane-mcp": number;
    "webflow-mcp": number;
    "amplitude-mcp": number;
    "typeform-mcp": number;
    "planetscale-mcp": number;
    "tally-mcp": number;
    "box-mcp": number;
    "dropbox-mcp": number;
    "freshdesk-mcp": number;
    "brevo-mcp": number;
    "resend-api": number;
    "stytch-mcp": number;
    "ramp-mcp": number;
    "xero-mcp": number;
    "sendgrid-api": number;
    "ahrefs-mcp": number;
    "apify-mcp": number;
    "netlify-api": number;
    "brightdata-mcp": number;
    "scrapingbee-mcp": number;
    "exa-mcp": number;
    "parallel-search-mcp": number;
    "coingecko-mcp": number;
    "modal-cli": number;
    "tavily-mcp": number;
    "cypress-mcp": number;
    "azure-devops-mcp": number;
    "jina-mcp": number;
    "buffer-mcp": number;
    "firecrawl-mcp": number;
    "incidentio-mcp": number;
    "hex-mcp": number;
    "browserbase-mcp": number;
    "pylon-mcp": number;
    "bitly-mcp": number;
    "axiom-api": number;
    "mapbox-mcp": number;
    "neon-mcp": number;
    "google-maps-mcp": number;
    "axiom-mcp": number;
    "granola-mcp": number;
    "devrev-mcp": number;
    "globalping-mcp": number;
    "heroku-mcp": number;
    "open-meteo-api": number;
    "browser-use-api": number;
    "scraperapi-mcp": number;
    "kalshi-api": number;
    "render-mcp": number;
    "mollie-mcp": number;
    "digitalocean-api": number;
    "mercury-mcp": number;
    "digitalocean-mcp": number;
    "polymarket-gamma-api": number;
    "tigris-mcp": number;
    "gitlab-rest-api": number;
    "wix-mcp": number;
    "paypal-mcp": number;
    "you-mcp": number;
    "lambdatest-mcp": number;
    "square-mcp": number;
    "dodo-payments-mcp": number;
    "docusign-mcp": number;
    "instacart-mcp": number;
    "pinterest-mcp": number;
    "sanity-mcp": number;
    "whoop-api": number;
    "clerk-mcp": number;
    "huggingface-mcp": number;
    "openai-mcp": number;
    "replicate-mcp": number;
    "fal-mcp": number;
    "plaid-mcp": number;
    "context7-mcp": number;
    "deepwiki-mcp": number;
    "stackoverflow-mcp": number;
    "gh-cli": number;
    "git-cli": number;
    "glab-cli": number;
    "echo-cli": number;
  };
};
declare const REGISTRY_CATALOG_AVAILABILITY: {
  manual_oauth_setup_slugs: string[];
  client_secret_required_slugs: string[];
  global_client_enabled_slugs: string[];
  known_broken_slugs: string[];
  superseded_by_kind: {
    "gh-cli": string;
    "github-graphql": string;
    "vercel-cli": string;
    "vercel-mcp": string;
    "wrangler-cli": string;
    "cloudflare-mcp": string;
    "glab-cli": string;
    "linear-mcp": string;
    "digitalocean-mcp": string;
    "asana-mcp": string;
    "axiom-mcp": string;
    "stripe-mcp": string;
    "figma-mcp": string;
    "openai-mcp": string;
  };
  install_verification_pending_slugs: string[];
};
//#endregion
//#region ../registry-catalog/src/index.d.ts
declare function canonicalJson(value: unknown): string;
//#endregion
export { REGISTRY_CATALOG_AVAILABILITY, REGISTRY_CATALOG_ENTRIES, REGISTRY_CATALOG_ENTRY_BY_SLUG, REGISTRY_CATALOG_ICON_HOST_OVERRIDES, REGISTRY_CATALOG_LOCAL_ICONS, REGISTRY_CATALOG_POPULARITY, REGISTRY_CATALOG_SLUGS, REGISTRY_CATALOG_VERSION, type RegistryCatalogEntryJson, type RegistryCatalogJson, canonicalJson };
//# sourceMappingURL=registry-catalog.d.mts.map