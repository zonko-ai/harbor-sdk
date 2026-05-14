import { describe, expect, it } from "bun:test"
import {
  createOAuthAuthorizationUrl,
  createOAuthPkcePair,
  exchangeOAuthAuthorizationCode,
  refreshOAuthTokenSet,
  registerOAuthDynamicClient,
} from "../src/index"

describe("@hrbr/source-auth OAuth helpers", () => {
  it("creates RFC7636 S256 PKCE values", () => {
    const pair = createOAuthPkcePair("test-verifier")
    expect(pair).toEqual({
      verifier: "test-verifier",
      challenge: "JBbiqONGWPaAmwXk_8bT6UnlPfrn65D32eZlJS-zGG0",
      method: "S256",
    })
  })

  it("builds authorization URLs with PKCE and optional scopes", () => {
    const url = new URL(createOAuthAuthorizationUrl({
      authorizationEndpoint: "https://auth.example.com/oauth/authorize",
      clientId: "client-id",
      redirectUri: "http://127.0.0.1:7331/oauth/callback",
      state: "state-1",
      codeChallenge: "challenge-1",
      scopes: ["read", "write"],
      resource: "https://mcp.example.com/mcp",
    }))

    expect(url.origin + url.pathname).toBe("https://auth.example.com/oauth/authorize")
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("client_id")).toBe("client-id")
    expect(url.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:7331/oauth/callback")
    expect(url.searchParams.get("state")).toBe("state-1")
    expect(url.searchParams.get("code_challenge")).toBe("challenge-1")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("scope")).toBe("read write")
    expect(url.searchParams.get("resource")).toBe("https://mcp.example.com/mcp")
  })

  it("registers public OAuth clients dynamically", async () => {
    const seen: { url?: string; body?: unknown } = {}
    const client = await registerOAuthDynamicClient({
      registrationEndpoint: "https://auth.example.com/register",
      clientName: "Harbor SDK Local",
      redirectUris: ["http://127.0.0.1:7331/oauth/callback"],
      scopes: ["read", "write"],
      fetch: async (url, init) => {
        seen.url = String(url)
        seen.body = JSON.parse(String(init?.body))
        return new Response(JSON.stringify({
          client_id: "client-id",
          client_secret: "client-secret",
          client_id_issued_at: 123,
        }), { headers: { "content-type": "application/json" } })
      },
    })

    expect(seen.url).toBe("https://auth.example.com/register")
    expect(seen.body).toMatchObject({
      client_name: "Harbor SDK Local",
      redirect_uris: ["http://127.0.0.1:7331/oauth/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: "read write",
    })
    expect(client).toMatchObject({
      clientId: "client-id",
      clientSecret: "client-secret",
      clientIdIssuedAt: 123,
    })
  })

  it("exchanges authorization codes and refresh tokens", async () => {
    const requests: string[] = []
    const fetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      requests.push(String(init?.body))
      return new Response(JSON.stringify({
        access_token: requests.length === 1 ? "access-token" : "next-access-token",
        refresh_token: "refresh-token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "read write",
      }), { headers: { "content-type": "application/json" } })
    }

    await expect(exchangeOAuthAuthorizationCode({
      tokenEndpoint: "https://auth.example.com/token",
      code: "code-1",
      codeVerifier: "verifier-1",
      clientId: "client-id",
      clientSecret: "client-secret",
      redirectUri: "http://127.0.0.1:7331/oauth/callback",
      fetch,
    })).resolves.toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "Bearer",
      scopes: ["read", "write"],
    })
    expect(requests[0]).toContain("grant_type=authorization_code")
    expect(requests[0]).toContain("code_verifier=verifier-1")

    await expect(refreshOAuthTokenSet({
      tokenEndpoint: "https://auth.example.com/token",
      refreshToken: "refresh-token",
      clientId: "client-id",
      fetch,
    })).resolves.toMatchObject({
      accessToken: "next-access-token",
    })
    expect(requests[1]).toContain("grant_type=refresh_token")
  })
})
