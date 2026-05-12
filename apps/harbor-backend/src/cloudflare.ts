export interface CloudflareConnectionCheck {
  readonly configured: boolean
  readonly ok: boolean
  readonly status: number | null
  readonly account_id_present: boolean
  readonly api_token_present: boolean
  readonly account_name?: string | undefined
  readonly error?: string | undefined
}

export type CloudflareFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>

interface CloudflareAccountResponse {
  readonly success?: boolean | undefined
  readonly result?: {
    readonly name?: string | undefined
  } | undefined
  readonly errors?: readonly { readonly message?: string | undefined }[] | undefined
}

export async function checkCloudflareStagingConnection(input?: {
  readonly fetch?: CloudflareFetch | undefined
}): Promise<CloudflareConnectionCheck> {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"]
  const apiToken = process.env["CLOUDFLARE_API_TOKEN"] ?? process.env["CLOUDFLARE_TOKEN"]
  const base = {
    account_id_present: Boolean(accountId),
    api_token_present: Boolean(apiToken),
  }

  if (!accountId || !apiToken) {
    return {
      ...base,
      configured: false,
      ok: false,
      status: null,
      error: "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN",
    }
  }

  const fetchImpl = input?.fetch ?? fetch
  const response = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
    headers: {
      authorization: `Bearer ${apiToken}`,
      accept: "application/json",
    },
  })
  const body = (await response.json().catch(() => null)) as CloudflareAccountResponse | null
  const ok = response.ok && body?.success !== false
  return {
    ...base,
    configured: true,
    ok,
    status: response.status,
    ...(body?.result?.name ? { account_name: body.result.name } : {}),
    ...(ok
      ? {}
      : {
          error:
            body?.errors?.find((item) => item.message)?.message ??
            `Cloudflare account request failed with status ${response.status}`,
        }),
  }
}
